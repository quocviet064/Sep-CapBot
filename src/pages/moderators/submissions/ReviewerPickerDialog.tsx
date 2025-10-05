import { useEffect, useMemo, useState } from "react";
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
import { toast } from "sonner";
import type { IdLike } from "@/services/reviewerAssignmentService";
import {
  useAvailableReviewers as useAvailableReviewersHook,
  useBulkAssignReviewers,
  useAssignReviewer,
} from "@/hooks/useReviewerAssignment";

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
  onConfirm?: (payload: any) => Promise<any> | any;
  onAssignedSuccess?: () => void;
  availableReviewers?: any[];
  loading?: boolean;
  confirmDisabled?: boolean;
  assignedCount?: number;
  requiredReviewers?: number;
  remainingSlots?: number;
}

export default function ReviewerPickerDialog({
  isOpen,
  onClose,
  submissionId,
  onConfirm,
  onAssignedSuccess,
  availableReviewers,
  loading,
  confirmDisabled,
  assignedCount = 0,
  requiredReviewers = 2,
  remainingSlots: propRemainingSlots,
}: Props) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<(string | number)[]>([]);
  const [assignmentType, setAssignmentType] = useState<number>(1);
  const [globalDeadline, setGlobalDeadline] = useState<string>("");

  const availableHook = useAvailableReviewersHook(submissionId);
  const hookData = availableHook.data ?? [];
  const hookLoading = availableHook.isLoading ?? false;

  const bulkAssign = useBulkAssignReviewers();
  const singleAssign = useAssignReviewer();

  const list = Array.isArray(availableReviewers) ? availableReviewers : hookData;
  const isListLoading = typeof loading === "boolean" ? loading : hookLoading;
  const isMutating = bulkAssign.isPending || singleAssign.isPending;
  const globalLoading = isListLoading || isMutating;

  useEffect(() => {
    if (!isOpen) {
      setSearch("");
      setSelected([]);
      setAssignmentType(1);
      setGlobalDeadline("");
    }
  }, [isOpen]);

  const allNormalized: RowVM[] = (list ?? []).map((r: any) => ({
    id: r.id,
    userName: r.userName ?? r.fullName ?? r.displayName ?? r.email ?? `#${r.id}`,
    email: r.email,
    currentAssignments: r.currentAssignments ?? r.current_assignments ?? 0,
  }));

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

  const remaining = typeof propRemainingSlots === "number"
    ? Math.max(0, propRemainingSlots)
    : Math.max(0, (requiredReviewers ?? 2) - (assignedCount ?? 0));

  const toggle = (id: string | number, checked: boolean) => {
    setSelected((prev) => {
      if (checked) {
        if (prev.length >= remaining) {
          toast.error(`Chỉ được chọn tối đa ${remaining} reviewer thêm.`);
          return prev;
        }
        return [...prev, id];
      } else {
        return prev.filter((x) => x !== id);
      }
    });
  };

  const toIso = (dateStr?: string) => {
    if (!dateStr) return undefined;
    try {
      const d = new Date(dateStr);
      return d.toISOString();
    } catch {
      return undefined;
    }
  };

  const canConfirm = selected.length > 0 && !globalLoading && !confirmDisabled && remaining > 0 && !!globalDeadline;

  const handleConfirm = async () => {
    if (!submissionId) {
      toast.error("Thiếu submissionId");
      return;
    }
    if (!globalDeadline) {
      toast.error("Vui lòng chọn deadline trước khi phân công");
      return;
    }
    if (selected.length === 0) {
      toast.error("Chọn ít nhất 1 reviewer");
      return;
    }
    if (selected.length > remaining) {
      toast.error(`Bạn chỉ có thể chọn tối đa ${remaining} reviewer.`);
      return;
    }

    const isoDeadline = toIso(globalDeadline);
    if (!isoDeadline) {
      toast.error("Deadline không hợp lệ");
      return;
    }

    const sid = typeof submissionId === "string" ? Number(submissionId) : submissionId;

    try {
      if (selected.length === 1) {
        const payload = {
          submissionId: sid,
          reviewerId: selected[0],
          assignmentType,
          deadline: isoDeadline,
        };
        await singleAssign.mutateAsync(payload);
        if (onConfirm) await onConfirm(payload);
      } else {
        const assignments = selected.map((rid) => ({
          submissionId: sid,
          reviewerId: rid,
          assignmentType,
          deadline: isoDeadline,
        }));
        await bulkAssign.mutateAsync({ assignments });
        if (onConfirm) await onConfirm({ assignments });
      }

      onAssignedSuccess?.();
      onClose();
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[1000px] max-h-[90vh] p-0 overflow-hidden">
        <div className="sticky top-0 z-10 border-b bg-white px-6 py-4">
          <DialogHeader>
            <DialogTitle>Chọn reviewer</DialogTitle>
            <DialogDescription>
              {submissionId
                ? `Tick reviewer để phân công cho Submission #${submissionId}. Remaining slots: ${remaining}`
                : "Vui lòng mở dialog theo 1 submission để dùng tính năng này."}
            </DialogDescription>
          </DialogHeader>
        </div>

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

        <div className="flex-1 overflow-auto px-6 pb-6 pt-4">
          <div className="h-[60vh] overflow-auto rounded-md border">
            {globalLoading ? (
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
                    const disableCheckbox = !checked && selected.length >= remaining;
                    return (
                      <tr key={String(r.id)} className={`border-t hover:bg-slate-50 ${checked ? "bg-blue-50" : ""}`}>
                        <td className="p-2 text-center">
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(v) => {
                              if (disableCheckbox && !!v) {
                                toast.error(`Bạn chỉ có thể chọn tối đa ${remaining} reviewer thêm.`);
                                return;
                              }
                              toggle(r.id, !!v);
                            }}
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

        <div className="sticky bottom-0 z-10 border-t bg-white px-6 py-4">
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={onClose} disabled={Boolean(confirmDisabled) || isMutating}>
              Hủy
            </Button>
            <Button onClick={handleConfirm} disabled={!canConfirm}>
              {isMutating ? "Đang phân công..." : `Xác nhận (${selected.length})`}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
