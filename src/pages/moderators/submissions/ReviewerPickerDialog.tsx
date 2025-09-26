import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/globals/atoms/dialog";
import { Button } from "@/components/globals/atoms/button";
import { Input } from "@/components/globals/atoms/input";
import { Checkbox } from "@/components/globals/atoms/checkbox";
import {
  useAvailableReviewers,
  useBulkAssignReviewers,
} from "@/hooks/useReviewerAssignment";
import { toast } from "sonner";
import type { IdLike } from "@/services/reviewerAssignmentService";

type RowVM = {
  id: number | string;
  userName?: string;
  email?: string;
  currentAssignments: number;
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  submissionId?: IdLike;
  onAssignedSuccess?: () => void;
}

export default function ReviewerPickerDialog({
  isOpen,
  onClose,
  submissionId,
  onAssignedSuccess,
}: Props) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<(string | number)[]>([]);
  const [assignmentType, setAssignmentType] = useState<number>(1);
  const [globalDeadline, setGlobalDeadline] = useState<string>("");

  useEffect(() => {
    if (!isOpen) {
      setSearch("");
      setSelected([]);
      setAssignmentType(1);
      setGlobalDeadline("");
    }
  }, [isOpen]);

  const availableQ = useAvailableReviewers(submissionId);
  const bulkMut = useBulkAssignReviewers();

  const allNormalized: RowVM[] = (availableQ.data ?? []).map((r: any) => ({
    id: r.id,
    userName: r.userName ?? r.email ?? `#${r.id}`,
    email: r.email,
    currentAssignments: r.currentAssignments ?? 0,
  }));

  const isListLoading = availableQ.isLoading;

  const filtered = useMemo(() => {
    if (!search.trim()) return allNormalized;
    const q = search.toLowerCase();
    return allNormalized.filter(
      (x) =>
        String(x.id).toLowerCase().includes(q) ||
        (x.userName ?? "").toLowerCase().includes(q) ||
        (x.email ?? "").toLowerCase().includes(q)
    );
  }, [allNormalized, search]);

  const toggle = (id: string | number, checked: boolean) => {
    setSelected((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));
  };

  const canConfirm = selected.length > 0 && !isListLoading;

  const toIso = (dateStr?: string) => {
    if (!dateStr) return undefined;
    try {
      const d = new Date(dateStr);
      return d.toISOString();
    } catch {
      return undefined;
    }
  };

  // Bulk-assign
  const doBulkAssign = () => {
    if (!submissionId) {
      toast.error("Thiếu submissionId");
      return;
    }
    if (!selected.length) {
      toast.error("Chọn ít nhất 1 reviewer");
      return;
    }
    if (!globalDeadline) {
      toast.error("Vui lòng chọn deadline trước khi phân công");
      return;
    }

    const isoDeadline = toIso(globalDeadline);
    const payload = {
      assignments: selected.map((rid) => ({
        submissionId,
        reviewerId: rid,
        assignmentType,
        deadline: isoDeadline,
      })),
    };

    bulkMut.mutate(payload as any, {
      onSuccess: (resp) => {
        if ((resp as any)?.success) {
          toast.success("Phân công thành công");
          onAssignedSuccess?.();
          onClose();
        } else {
          toast.error((resp as any)?.message || "Bulk assign thất bại");
        }
      },
      onError: (e) => {
        toast.error(e instanceof Error ? e.message : "Bulk assign thất bại");
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[1000px] max-h-[90vh] p-0 overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b bg-white px-6 py-4">
          <DialogHeader>
            <DialogTitle>Chọn reviewer</DialogTitle>
            <DialogDescription>
              {submissionId
                ? `Tick reviewer để phân công cho Submission #${submissionId}.`
                : "Vui lòng mở dialog theo 1 submission để dùng tính năng này."}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 px-6 py-4 border-b bg-slate-50">
          <Input
            placeholder="Tìm reviewer theo tên / email / id..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[300px]"
          />

          <div className="flex items-center gap-2">
            <label className="text-sm">Loại phân công:</label>
            <select
              className="rounded border px-2 py-1 text-sm"
              value={assignmentType}
              onChange={(e) => setAssignmentType(Number(e.target.value))}
            >
              <option value={1}>Primary</option>
              <option value={2}>Secondary</option>
              <option value={3}>Additional</option>
            </select>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <label className="text-sm">Deadline:</label>
            <input
              type="date"
              value={globalDeadline}
              onChange={(e) => setGlobalDeadline(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            />
          </div>
        </div>

        {/* Reviewer list */}
        <div className="flex-1 overflow-auto px-6 pb-6 pt-4">
          <div className="h-[60vh] overflow-auto rounded-md border">
            {isListLoading ? (
              <div className="p-4 text-sm text-gray-500">Đang tải reviewer...</div>
            ) : filtered.length === 0 ? (
              <div className="p-4 text-sm text-gray-500">Không có reviewer phù hợp</div>
            ) : (
              <table className="w-full text-sm border-collapse">
                <thead className="sticky top-0 z-10 bg-slate-100">
                  <tr>
                    <th className="w-10 p-2"></th>
                    <th className="p-2 text-left">ID</th>
                    <th className="p-2 text-left">Tên reviewer</th>
                    <th className="p-2 text-left">Email</th>
                    <th className="p-2 text-center">Đang review</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => {
                    const checked = selected.includes(r.id);
                    return (
                      <tr
                        key={String(r.id)}
                        className={`border-t hover:bg-slate-50 ${
                          checked ? "bg-blue-50" : ""
                        }`}
                      >
                        <td className="p-2 text-center">
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(v) => toggle(r.id, !!v)}
                          />
                        </td>
                        <td className="p-2">{String(r.id)}</td>
                        <td className="p-2">{r.userName ?? "—"}</td>
                        <td className="p-2">{r.email ?? "—"}</td>
                        <td className="p-2 text-center">{r.currentAssignments}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 z-10 border-t bg-white px-6 py-4">
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={onClose} disabled={bulkMut.isPending}>
              Hủy
            </Button>
            <Button onClick={doBulkAssign} disabled={!canConfirm || bulkMut.isPending}>
              {bulkMut.isPending
                ? "Đang phân công..."
                : `Xác nhận (${selected.length})`}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
