import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/globals/atoms/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/globals/atoms/dialog";
import { formatDateTime } from "@/utils/formatter";
import {
  fetchPhaseDetail,
  type PhaseDetail,
  type PhaseUpdateDto,
} from "@/services/phaseService";
import {
  CalendarRange,
  Copy,
  Loader2,
  PencilLine,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useDeletePhase, useUpdatePhase } from "@/hooks/usePhase";
import { useAllPhaseTypes } from "@/hooks/usePhaseType";
import { useSemesters } from "@/hooks/useSemester";
import { motion } from "framer-motion";

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

const clamp = (n: number, a: number, b: number) => Math.min(Math.max(n, a), b);

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200/70 bg-white/80 shadow-sm ring-1 ring-black/5 backdrop-blur">
      <div className="flex items-center justify-between border-b px-5 py-3">
        <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function Row({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="grid grid-cols-12 items-start gap-4 py-3">
      <div className="col-span-4 sm:col-span-3">
        <div className="text-[11px] font-semibold tracking-wide text-neutral-500 uppercase">
          {label}
        </div>
        {hint && <p className="mt-1 text-[11px] text-neutral-500">{hint}</p>}
      </div>
      <div className="col-span-8 sm:col-span-9">{children}</div>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50/80 px-3 py-1 text-xs font-medium text-indigo-700">
      {children}
    </span>
  );
}

function FieldInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={[
        "w-full rounded-xl border px-3.5 py-2.5 text-sm",
        "border-neutral-200 bg-white shadow-inner outline-none",
        "focus:border-indigo-400 focus:ring-4 focus:ring-indigo-200/60",
        props.className || "",
      ].join(" ")}
    />
  );
}

function FieldSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={[
        "w-full rounded-xl border px-3.5 py-2.5 text-sm",
        "border-neutral-200 bg-white shadow-inner outline-none",
        "focus:border-indigo-400 focus:ring-4 focus:ring-indigo-200/60",
        props.className || "",
      ].join(" ")}
    />
  );
}

function SkeletonRow() {
  return (
    <div className="grid grid-cols-12 items-center gap-4 py-3">
      <div className="col-span-4 sm:col-span-3">
        <div className="h-2.5 w-24 animate-pulse rounded bg-neutral-200" />
      </div>
      <div className="col-span-8 sm:col-span-9">
        <div className="h-10 w-full animate-pulse rounded-xl bg-neutral-200" />
      </div>
    </div>
  );
}

function TimelineBar({
  start,
  deadline,
  end,
}: {
  start?: string | null;
  deadline?: string | null;
  end?: string | null;
}) {
  if (!start || !end) return null;
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (Number.isNaN(s) || Number.isNaN(e) || s >= e) return null;
  const d = deadline ? new Date(deadline).getTime() : NaN;
  const pct = (v: number) => clamp(((v - s) / (e - s)) * 100, 0, 100);
  const nowPct = pct(Date.now());
  const deadlinePct = Number.isNaN(d) ? undefined : pct(d);

  return (
    <div className="mt-2">
      <div className="relative h-2 w-full rounded-full bg-neutral-200">
        <div
          className="absolute top-0 left-0 h-2 rounded-full bg-gradient-to-r from-indigo-400 to-indigo-600"
          style={{ width: `${nowPct}%` }}
        />
        {typeof deadlinePct === "number" && (
          <div
            className="absolute -top-1 h-4 w-0.5 -translate-x-1/2 rounded bg-amber-500"
            style={{ left: `${deadlinePct}%` }}
            title="Hạn nộp"
          />
        )}
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-neutral-500">
        <span>{toYMD(start)}</span>
        {deadline && <span>Hạn: {toYMD(deadline)}</span>}
        <span>{toYMD(end)}</span>
      </div>
    </div>
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
  const { mutate: deleteMutate, isPending: isDeleting } = useDeletePhase();

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

  const isDirty = useMemo(() => {
    if (!form || !detail) return false;
    return (
      form.name !== detail.name ||
      form.semesterId !== detail.semesterId ||
      form.phaseTypeId !== detail.phaseTypeId ||
      form.startDate !== toYMD(detail.startDate) ||
      form.endDate !== toYMD(detail.endDate) ||
      form.submissionDeadline !== toYMD(detail.submissionDeadline)
    );
  }, [form, detail]);

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
        } catch (e: unknown) {
          const msg =
            e instanceof Error ? e.message : "Không thể tải lại dữ liệu";
          setErrorMsg(msg);
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

  const closeOrConfirm = () => {
    if (isEditing && isDirty) {
      const ok = window.confirm(
        "Bạn có thay đổi chưa lưu. Bạn có chắc muốn đóng?",
      );
      if (!ok) return;
    }
    onClose();
  };

  const handleDelete = () => {
    if (!detail) return;
    const ok = window.confirm(
      `Xóa giai đoạn "${detail.name}"? Hành động này không thể hoàn tác.`,
    );
    if (!ok) return;

    deleteMutate(Number(detail.id), {
      onSuccess: () => {
        toast.success("Đã xóa giai đoạn");
        onClose();
      },
      onError: (e: unknown) => {
        const msg = e instanceof Error ? e.message : "Xóa thất bại";
        toast.error(msg);
      },
    });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!isEditing) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (!isSaving && canSave) handleSave();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isEditing, isSaving, canSave]);

  return (
    <Dialog open={isOpen} onOpenChange={closeOrConfirm}>
      <DialogContent className="w-[980px] max-w-[96vw] overflow-hidden p-0">
        <div className="relative">
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-indigo-600 to-violet-600" />
          <div
            className="absolute inset-0 -z-10 opacity-60"
            style={{
              backgroundImage:
                "radial-gradient(1200px 400px at -10% -40%, rgba(255,255,255,.35), transparent 60%), radial-gradient(900px 300px at 110% -30%, rgba(255,255,255,.25), transparent 60%)",
            }}
          />

          <div className="flex items-center justify-between px-6 py-5 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20 backdrop-blur">
                <CalendarRange className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-[18px] font-semibold">
                  {isEditing ? "Chỉnh sửa giai đoạn" : "Chi tiết giai đoạn"}
                </DialogTitle>
                <DialogDescription className="text-[12px] text-white/80">
                  {isEditing
                    ? "Cập nhật thông tin giai đoạn (tên, loại, học kỳ, thời gian)."
                    : "Xem thông tin chi tiết của giai đoạn."}
                </DialogDescription>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5 bg-neutral-50 px-6 py-6">
          {errorMsg && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMsg}
            </div>
          )}

          {loading ? (
            <Section title="Đang tải">
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonRow key={i} />
                ))}
              </div>
            </Section>
          ) : !detail ? (
            <div className="rounded-xl border border-dashed border-neutral-300 bg-white/50 px-6 py-10 text-center text-sm text-neutral-600">
              Chưa có dữ liệu. Hãy thử tải lại.
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className="grid grid-cols-1 gap-5 lg:grid-cols-2"
            >
              <Section title="Thông tin chung">
                <Row label="Mã giai đoạn">
                  <div className="flex items-center gap-2">
                    <div className="font-mono text-sm font-medium text-neutral-900">
                      #{detail.id}
                    </div>
                    <button
                      className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 px-2 py-1 text-[11px] text-neutral-700 transition-colors hover:bg-neutral-50"
                      onClick={() =>
                        handleCopy(String(detail.id), "mã giai đoạn")
                      }
                      title="Sao chép mã"
                    >
                      <Copy className="h-3.5 w-3.5" /> Sao chép
                    </button>
                  </div>
                </Row>
                <div className="border-t" />

                <Row label="Tên giai đoạn">
                  {!isEditing ? (
                    <div className="text-sm font-medium text-neutral-900">
                      {detail.name ?? "--"}
                    </div>
                  ) : (
                    <FieldInput
                      value={form?.name ?? ""}
                      onChange={(e) => onChange("name", e.target.value)}
                      placeholder="VD: Đề cương, Bảo vệ, ..."
                      maxLength={200}
                    />
                  )}
                </Row>
                <div className="border-t" />

                <Row label="Loại giai đoạn">
                  {!isEditing ? (
                    <Pill>{detail.phaseTypeName ?? "--"}</Pill>
                  ) : (
                    <FieldSelect
                      value={form?.phaseTypeId ?? ""}
                      onChange={(e) =>
                        onChange("phaseTypeId", Number(e.target.value))
                      }
                      disabled={!phaseTypes?.length}
                    >
                      <option value="" disabled>
                        {phaseTypes?.length
                          ? "Chọn loại giai đoạn"
                          : "Đang tải ..."}
                      </option>
                      {(phaseTypes ?? []).map((pt) => (
                        <option key={pt.id} value={pt.id}>
                          {pt.name}
                        </option>
                      ))}
                    </FieldSelect>
                  )}
                </Row>
                <div className="border-t" />

                <Row label="Học kỳ">
                  {!isEditing ? (
                    <Pill>{detail.semesterName ?? "--"}</Pill>
                  ) : (
                    <FieldSelect
                      value={form?.semesterId ?? ""}
                      onChange={(e) =>
                        onChange("semesterId", Number(e.target.value))
                      }
                      disabled={!semesters?.length}
                    >
                      <option value="" disabled>
                        {semesters?.length ? "Chọn học kỳ" : "Đang tải ..."}
                      </option>
                      {(semesters ?? []).map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </FieldSelect>
                  )}
                </Row>
              </Section>

              <Section title="Thời gian">
                <Row label="Ngày bắt đầu">
                  {!isEditing ? (
                    <div className="text-sm font-medium text-neutral-900">
                      {detail ? formatDateTime(detail.startDate) : "--"}
                    </div>
                  ) : (
                    <FieldInput
                      type="date"
                      value={form?.startDate ?? ""}
                      onChange={(e) => onChange("startDate", e.target.value)}
                      max={form?.endDate || undefined}
                      className="w-[220px]"
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
                    <FieldInput
                      type="date"
                      value={form?.endDate ?? ""}
                      onChange={(e) => onChange("endDate", e.target.value)}
                      min={form?.startDate || undefined}
                      className="w-[220px]"
                    />
                  )}
                </Row>
                <div className="border-t" />

                <Row label="Hạn nộp">
                  {!isEditing ? (
                    <div className="text-sm font-medium text-neutral-900">
                      {detail
                        ? formatDateTime(detail.submissionDeadline)
                        : "--"}
                    </div>
                  ) : (
                    <FieldInput
                      type="date"
                      value={form?.submissionDeadline ?? ""}
                      onChange={(e) =>
                        onChange("submissionDeadline", e.target.value)
                      }
                      max={form?.endDate || undefined}
                      min={form?.startDate || undefined}
                      className="w-[220px]"
                    />
                  )}
                </Row>

                <TimelineBar
                  start={detail.startDate}
                  deadline={detail.submissionDeadline}
                  end={detail.endDate}
                />
              </Section>
            </motion.div>
          )}
        </div>

        <DialogFooter className="sticky bottom-0 z-10 border-t bg-white/85 px-6 py-4 backdrop-blur">
          {!isEditing ? (
            <div className="flex w-full items-center justify-between">
              <div>
                <Button
                  variant="outline"
                  onClick={closeOrConfirm}
                  disabled={isSaving || isDeleting}
                  className="gap-2"
                >
                  <X className="h-4 w-4" /> Đóng
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setIsEditing(true)}
                  disabled={isSaving || isDeleting || !detail}
                  className="gap-2"
                >
                  <PencilLine className="h-4 w-4" /> Chỉnh sửa
                </Button>

                <Button
                  variant="outline"
                  onClick={handleDelete}
                  disabled={isDeleting || isSaving || !detail}
                  className="gap-2 border-red-300 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" /> Xóa
                </Button>
              </div>
            </div>
          ) : (
            <div className="ml-auto flex items-center gap-2">
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
                disabled={isSaving || isDeleting}
              >
                Huỷ
              </Button>

              <Button
                onClick={handleSave}
                disabled={!canSave || isSaving || isDeleting}
                className="gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" /> Lưu thay đổi
                  </>
                )}
              </Button>
            </div>
          )}
        </DialogFooter>

        {isSaving && (
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-white/50">
            <div className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-700 shadow-sm">
              <Loader2 className="h-4 w-4 animate-spin" /> Đang lưu...
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
