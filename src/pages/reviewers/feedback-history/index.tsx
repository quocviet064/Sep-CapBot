import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import LoadingPage from "@/pages/loading-page";
import { DataTable } from "@/components/globals/atoms/data-table";
import { Input } from "@/components/globals/atoms/input";
import { Button } from "@/components/globals/atoms/button";
import DataTableColumnHeader from "@/components/globals/molecules/data-table-column-header";
import DataTableDate from "@/components/globals/molecules/data-table-date";

import { useMyAssignments } from "@/hooks/useReviewerAssignment";
import { useWithdrawReview } from "@/hooks/useReview";

import {
  getReviewsByAssignment,
  getScoreBoard,
  type ReviewDTO,
} from "@/services/reviewService";

type RowItem = {
  // assignment-level
  assignmentId: number;
  submissionId: number;
  submissionTitle?: string | null;
  topicTitle?: string | null;

  // reviewer (chính mình vì dùng my-assignments)
  reviewerId: number;
  reviewerEmail?: string | null;

  // review chọn để hiển thị (của chính assignment đó)
  reviewId?: number;
  reviewStatus?: string; // "Draft" | "Submitted" | "Withdrawn" (nếu có)
  createdAt?: string | null;
  updatedAt?: string | null;
};

const REVIEW_STATUS = {
  ALL: "all",
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  WITHDRAWN: "Withdrawn",
} as const;

export default function ReviewerFeedbackInbox() {
  const navigate = useNavigate();

  // 1) Lấy assignments của CHÍNH reviewer (từ JWT)
  const { data, isLoading, error } = useMyAssignments();
  const assignments = data ?? [];

  // 2) Kéo review cho từng assignment & dựng "hộp thư"
  const [rows, setRows] = useState<RowItem[]>([]);
  const [loadingRows, setLoadingRows] = useState(false);

  // 3) Lọc + chọn
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(REVIEW_STATUS.ALL);
  const [selected, setSelected] = useState<RowItem | null>(null);

  const withdrawMut = useWithdrawReview();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!assignments.length) {
        setRows([]);
        setSelected(null);
        return;
      }
      setLoadingRows(true);
      try {
        const packed = await Promise.all(
          assignments.map(async (a: any) => {
            // lấy review theo assignment
            let my: ReviewDTO | undefined;
            try {
              const list = await getReviewsByAssignment(a.id);
              // nếu có nhiều (nhiều vòng), ưu tiên Submitted; nếu không có thì lấy bản cập nhật mới nhất
              if (Array.isArray(list) && list.length > 0) {
                const submitted = list.find((r) => r.status === "Submitted");
                my =
                  submitted ??
                  [...list].sort((x, y) =>
                    String(y.updatedAt ?? "").localeCompare(String(x.updatedAt ?? ""))
                  )[0];
              }
            } catch {
              // ignore, vẫn render assignment
            }

            const row: RowItem = {
              assignmentId: Number(a.id),
              submissionId: Number(a.submissionId),
              submissionTitle: a.submissionTitle ?? null,
              topicTitle: a.topicTitle ?? null,
              reviewerId: Number(a.reviewer?.id ?? a.reviewerId),
              reviewerEmail: a.reviewer?.email ?? null,
              reviewId: my ? (Number(my.id) as number) : undefined,
              reviewStatus: my?.status,
              createdAt: my?.createdAt ?? null,
              updatedAt: my?.updatedAt ?? null,
            };
            return row;
          })
        );
        if (!cancelled) {
          setRows(packed);
          // nếu chưa chọn gì thì chọn dòng đầu
          if (!selected && packed.length) setSelected(packed[0]);
        }
      } finally {
        if (!cancelled) setLoadingRows(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignments]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      const okStatus =
        statusFilter === REVIEW_STATUS.ALL ? true : String(r.reviewStatus ?? "") === statusFilter;
      if (!okStatus) return false;

      if (!q) return true;
      const hay = `${r.assignmentId} ${r.submissionId} ${r.submissionTitle ?? ""} ${r.topicTitle ?? ""} ${r.reviewerEmail ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [rows, search, statusFilter]);

  if (isLoading || loadingRows) return <LoadingPage />;
  if (error) return <div className="p-6 text-red-600">Lỗi tải dữ liệu: {(error as Error).message}</div>;

  return (
    <div className="h-[calc(100vh-120px)] grid grid-cols-1 md:grid-cols-2">
      {/* MASTER: danh sách như "inbox" */}
      <div className="border-r flex flex-col min-h-0">
        <Toolbar
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />
        <div className="flex-1 min-h-0 overflow-auto">
          <InboxTable
            data={filtered}
            onOpen={(row) => setSelected(row)}
            selectedId={selected?.assignmentId}
          />
        </div>
      </div>

      {/* DETAIL: preview read-only */}
      <div className="min-h-0 overflow-auto">
        {!selected ? (
          <EmptyState text="Chọn một đề tài ở khung bên trái để xem phản hồi" />
        ) : (
          <PreviewPane
            row={selected}
            onOpenReview={(r) =>
              navigate(`/reviewers/evaluate-topics/review?assignmentId=${r.assignmentId}`)
            }
            onOpenSubmission={(r) =>
              navigate(`/reviewers/assigned-topics/detail?submissionId=${r.submissionId}`)
            }
            onWithdraw={async (r) => {
              if (!r.reviewId) {
                toast.info("Chưa có review để rút.");
                return;
              }
              if (!window.confirm("Bạn có chắc muốn rút lại đánh giá này?")) return;
              withdrawMut.mutate(r.reviewId);
            }}
          />
        )}
      </div>
    </div>
  );
}

/* ===================== Master: Toolbar + Table ===================== */

function Toolbar({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
}: {
  search: string;
  setSearch: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
}) {
  return (
    <div className="p-3 border-b space-y-2">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[260px]">
          <label className="block text-sm mb-1">Tìm kiếm</label>
          <Input
            placeholder="Đề tài / submission / email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Trạng thái review</label>
          <select
            className="rounded border px-2 py-2 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value={REVIEW_STATUS.ALL}>Tất cả</option>
            <option value={REVIEW_STATUS.DRAFT}>Draft</option>
            <option value={REVIEW_STATUS.SUBMITTED}>Submitted</option>
            <option value={REVIEW_STATUS.WITHDRAWN}>Withdrawn</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function InboxTable({
  data,
  onOpen,
  selectedId,
}: {
  data: RowItem[];
  onOpen: (row: RowItem) => void;
  selectedId?: number;
}) {
  const columns = useMemo(
    () => [
      {
        accessorKey: "assignmentId",
        header: ({ column }: any) => (
          <DataTableColumnHeader column={column} title="Assign" />
        ),
        cell: ({ row }: any) => `#${row.original.assignmentId}`,
      },
      {
        accessorKey: "title",
        header: ({ column }: any) => (
          <DataTableColumnHeader column={column} title="Đề tài" />
        ),
        cell: ({ row }: any) =>
          row.original.topicTitle?.trim() ||
          row.original.submissionTitle?.trim() ||
          `Submission #${row.original.submissionId}`,
      },
      {
        accessorKey: "reviewStatus",
        header: ({ column }: any) => (
          <DataTableColumnHeader column={column} title="Trạng thái" />
        ),
        cell: ({ row }: any) => row.original.reviewStatus ?? "—",
      },
      {
        accessorKey: "updatedAt",
        header: ({ column }: any) => (
          <DataTableColumnHeader column={column} title="Cập nhật" />
        ),
        cell: ({ row }: any) =>
          row.original.updatedAt ? (
            <DataTableDate date={row.original.updatedAt} />
          ) : (
            "—"
          ),
      },
      {
        id: "open",
        header: () => <span className="sr-only">Open</span>,
        cell: ({ row }: any) => (
          <Button size="sm" variant="secondary" onClick={() => onOpen(row.original)}>
            Xem
          </Button>
        ),
      },
    ],
    [onOpen]
  ) as any[];

  // DataTable đã hỗ trợ sorting/filtering; chọn dòng hiện hành bằng border trái khác màu (CSS tùy ý)
  return (
    <div className="p-3">
      <DataTable<RowItem, unknown>
        data={data}
        columns={columns}
        placeholder="Tìm theo đề tài, submission, email…"
        rowClassName={(r) =>
          r.original.assignmentId === selectedId ? "border-l-2 border-primary" : ""
        }
      />
    </div>
  );
}

/* ===================== Detail: Preview Pane (read-only) ===================== */

function PreviewPane({
  row,
  onOpenReview,
  onOpenSubmission,
  onWithdraw,
}: {
  row: RowItem;
  onOpenReview: (r: RowItem) => void;
  onOpenSubmission: (r: RowItem) => void;
  onWithdraw: (r: RowItem) => void;
}) {
  const [sb, setSb] = useState<Awaited<ReturnType<typeof getScoreBoard>> | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let stop = false;
    async function load() {
      if (!row.reviewId) {
        setSb(null);
        return;
      }
      setLoading(true);
      try {
        const data = await getScoreBoard(row.reviewId);
        if (!stop) setSb(data);
      } catch (e: any) {
        toast.error(e?.message || "Không thể tải bảng điểm");
      } finally {
        if (!stop) setLoading(false);
      }
    }
    load();
    return () => {
      stop = true;
    };
  }, [row.reviewId]);

  const title =
    row.topicTitle?.trim() ||
    row.submissionTitle?.trim() ||
    `Submission #${row.submissionId}`;

  const canWithdraw = row.reviewStatus === "Submitted" && !!row.reviewId;

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">
          Assignment #{row.assignmentId} • Trạng thái review:{" "}
          <b>{row.reviewStatus ?? "—"}</b>
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => onOpenReview(row)}>
          {row.reviewStatus === "Draft" ? "Tiếp tục đánh giá" : "Mở đánh giá"}
        </Button>
        <Button size="sm" variant="outline" onClick={() => onOpenSubmission(row)}>
          Xem Submission
        </Button>
        <Button
          size="sm"
          variant="destructive"
          disabled={!canWithdraw}
          onClick={() => onWithdraw(row)}
          title={
            canWithdraw ? "Rút lại đánh giá" : "Chỉ rút khi đã submit & có reviewId"
          }
        >
          Rút đánh giá
        </Button>
      </div>

      <div className="rounded border p-3">
        <div className="mb-2 text-sm font-medium">Bảng tiêu chí & điểm</div>
        {loading && <div className="text-sm text-muted-foreground">Đang tải…</div>}
        {!loading && !row.reviewId && (
          <div className="text-sm text-muted-foreground">
            Chưa có review để hiển thị.
          </div>
        )}
        {!loading && row.reviewId && sb && (
          <div className="space-y-3">
            <div className="text-sm">
              Tổng điểm: <b>{sb.overallScore ?? "—"}</b>
            </div>
            <div className="rounded border overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-2 text-left">Tiêu chí</th>
                    <th className="p-2 text-right">Điểm</th>
                    <th className="p-2 text-right">Tối đa</th>
                    <th className="p-2 text-right">Trọng số</th>
                    <th className="p-2 text-left">Nhận xét</th>
                  </tr>
                </thead>
                <tbody>
                  {sb.criteriaScores.map((c) => (
                    <tr key={c.criteriaId} className="border-t">
                      <td className="p-2">{c.criteriaName}</td>
                      <td className="p-2 text-right">{c.score}</td>
                      <td className="p-2 text-right">{c.maxScore}</td>
                      <td className="p-2 text-right">{c.weight}</td>
                      <td className="p-2">{c.comment ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ===================== Small helpers ===================== */

function EmptyState({ text }: { text: string }) {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <div className="text-sm text-muted-foreground">{text}</div>
    </div>
  );
}
