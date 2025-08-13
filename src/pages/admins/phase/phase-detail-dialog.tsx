import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/globals/atoms/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/globals/atoms/dialog";
import { formatDateTime } from "@/utils/formatter";
import {
  fetchPhaseDetail,
  type PhaseDetail,
  type PhaseUpdateDto,
} from "@/services/phaseService";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { useUpdatePhase } from "@/hooks/usePhase";
import { useAllPhaseTypes } from "@/hooks/usePhaseType";
import { useSemesters } from "@/hooks/useSemester";

const toYMD = (isoOrYmd?: string | null) => {
  if (!isoOrYmd) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoOrYmd)) return isoOrYmd;
  const d = new Date(isoOrYmd);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-3 items-start gap-4 py-3">
      <div className="col-span-1">
        <div className="text-[11px] font-semibold tracking-wide text-neutral-500 uppercase">
          {label}
        </div>
      </div>
      <div className="col-span-2">{children}</div>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs font-medium text-neutral-700">
      {children}
    </span>
  );
}

interface PhaseDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  phaseId: string | null;
}

export default function PhaseDetailDialog({
  isOpen,
  onClose,
  phaseId,
}: PhaseDetailDialogProps) {
  const [detail, setDetail] = useState<PhaseDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [form, setForm] = useState<PhaseUpdateDto | null>(null);

  const { mutate: updateMutate, isPending: isSaving } = useUpdatePhase();
  const { data: phaseTypes } = useAllPhaseTypes("");
  const { data: semesters } = useSemesters();
  useEffect(() => {
    if (!isOpen || !phaseId) return;
    setLoading(true);
    setErrorMsg(null);
    setDetail(null);
    setIsEditing(false);

    fetchPhaseDetail(phaseId)
      .then((d) => {
        setDetail(d);
        setForm({
          id: d.id,
          semesterId: d.semesterId,
          phaseTypeId: d.phaseTypeId,
          name: d.name,
          startDate: toYMD(d.startDate),
          endDate: toYMD(d.endDate),
          submissionDeadline: toYMD(d.submissionDeadline),
        });
      })
      .catch((err) => setErrorMsg(err?.message || "Không thể tải dữ liệu"))
      .finally(() => setLoading(false));
  }, [isOpen, phaseId]);

  const onChange = (key: keyof PhaseUpdateDto, value: string | number) =>
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));

  const canSave = useMemo(() => {
    if (!form) return false;
    return (
      !!form.name?.trim() &&
      !!form.startDate &&
      !!form.endDate &&
      !!form.submissionDeadline &&
      Number.isFinite(form.semesterId) &&
      Number.isFinite(form.phaseTypeId)
    );
  }, [form]);

  const handleSave = () => {
    if (!form) return;

    if (new Date(form.startDate) > new Date(form.endDate)) {
      toast.error("Ngày bắt đầu phải trước hoặc bằng ngày kết thúc");
      return;
    }
    if (new Date(form.submissionDeadline) > new Date(form.endDate)) {
      toast.error("Hạn nộp không được sau ngày kết thúc");
      return;
    }

    updateMutate(form, {
      onSuccess: async () => {
        setLoading(true);
        try {
          const fresh = await fetchPhaseDetail(form.id);
          setDetail(fresh);
          setIsEditing(false);
          toast.success("Đã lưu thay đổi");
        } catch (e: any) {
          setErrorMsg(e?.message || "Không thể tải lại dữ liệu");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleCopy = (text: string, label?: string) => {
    navigator.clipboard.writeText(text);
    toast.success(label ? `Đã sao chép ${label}` : "Đã sao chép");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[820px] max-w-[92vw]">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-[18px]">
            {isEditing ? "Chỉnh sửa giai đoạn" : "Chi tiết giai đoạn"}
          </DialogTitle>
          <DialogDescription className="text-[12px]">
            {isEditing
              ? "Cập nhật thông tin giai đoạn (tên, loại, học kỳ, thời gian)."
              : "Xem thông tin chi tiết của giai đoạn."}
          </DialogDescription>
        </DialogHeader>

        {errorMsg && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMsg}
          </div>
        )}

        <div className="rounded-xl border bg-white">
          <div className="px-5">
            <Row label="Mã giai đoạn">
              <div className="flex items-center gap-2">
                <div className="font-mono text-sm font-medium text-neutral-900">
                  {detail ? `#${detail.id}` : "--"}
                </div>
                {detail && (
                  <button
                    className="inline-flex items-center rounded border border-neutral-300 px-2 py-1 text-[11px] text-neutral-700 hover:bg-neutral-50"
                    onClick={() =>
                      handleCopy(String(detail.id), "mã giai đoạn")
                    }
                  >
                    <Copy className="mr-1 h-3.5 w-3.5" />
                    Sao chép
                  </button>
                )}
              </div>
            </Row>
            <div className="border-t" />

            <Row label="Tên giai đoạn">
              {!isEditing ? (
                <div className="text-sm font-medium text-neutral-900">
                  {detail?.name ?? "--"}
                </div>
              ) : (
                <input
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={form?.name ?? ""}
                  onChange={(e) => onChange("name", e.target.value)}
                  placeholder="Tên giai đoạn"
                />
              )}
            </Row>
            <div className="border-t" />

            <Row label="Loại giai đoạn">
              {!isEditing ? (
                <Pill>{detail?.phaseTypeName ?? "--"}</Pill>
              ) : (
                <select
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={form?.phaseTypeId ?? ""}
                  onChange={(e) =>
                    onChange("phaseTypeId", Number(e.target.value))
                  }
                >
                  <option value="" disabled>
                    Chọn loại giai đoạn
                  </option>
                  {(phaseTypes ?? []).map((pt) => (
                    <option key={pt.id} value={pt.id}>
                      {pt.name}
                    </option>
                  ))}
                </select>
              )}
            </Row>
            <div className="border-t" />

            <Row label="Học kỳ">
              {!isEditing ? (
                <Pill>{detail?.semesterName ?? "--"}</Pill>
              ) : (
                <select
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={form?.semesterId ?? ""}
                  onChange={(e) =>
                    onChange("semesterId", Number(e.target.value))
                  }
                >
                  <option value="" disabled>
                    Chọn học kỳ
                  </option>
                  {(semesters ?? []).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              )}
            </Row>
            <div className="border-t" />

            <Row label="Ngày bắt đầu">
              {!isEditing ? (
                <div className="text-sm font-medium text-neutral-900">
                  {detail ? formatDateTime(detail.startDate) : "--"}
                </div>
              ) : (
                <input
                  type="date"
                  className="w-[200px] rounded-md border px-3 py-2 text-sm"
                  value={form?.startDate ?? ""}
                  onChange={(e) => onChange("startDate", e.target.value)}
                />
              )}
            </Row>
            <div className="border-t" />

            <Row label="Ngày kết thúc">
              {!isEditing ? (
                <div className="text-sm font-medium text-neutral-900">
                  {detail ? formatDateTime(detail.endDate) : "--"}
                </div>
              ) : (
                <input
                  type="date"
                  className="w-[200px] rounded-md border px-3 py-2 text-sm"
                  value={form?.endDate ?? ""}
                  onChange={(e) => onChange("endDate", e.target.value)}
                />
              )}
            </Row>
            <div className="border-t" />

            <Row label="Hạn nộp">
              {!isEditing ? (
                <div className="text-sm font-medium text-neutral-900">
                  {detail ? formatDateTime(detail.submissionDeadline) : "--"}
                </div>
              ) : (
                <input
                  type="date"
                  className="w-[200px] rounded-md border px-3 py-2 text-sm"
                  value={form?.submissionDeadline ?? ""}
                  onChange={(e) =>
                    onChange("submissionDeadline", e.target.value)
                  }
                />
              )}
            </Row>
          </div>
        </div>

        <DialogFooter className="gap-2">
          {isEditing ? (
            <Button
              variant="outline"
              onClick={() => {
                if (detail) {
                  setForm({
                    id: detail.id,
                    semesterId: detail.semesterId,
                    phaseTypeId: detail.phaseTypeId,
                    name: detail.name,
                    startDate: toYMD(detail.startDate),
                    endDate: toYMD(detail.endDate),
                    submissionDeadline: toYMD(detail.submissionDeadline),
                  });
                }
                setIsEditing(false);
              }}
              disabled={isSaving}
            >
              Huỷ
            </Button>
          ) : (
            <Button variant="outline" onClick={onClose}>
              Đóng
            </Button>
          )}

          {detail && !isEditing && (
            <Button onClick={() => setIsEditing(true)} disabled={isSaving}>
              Chỉnh sửa
            </Button>
          )}
          {isEditing && (
            <Button onClick={handleSave} disabled={!canSave || isSaving}>
              {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
