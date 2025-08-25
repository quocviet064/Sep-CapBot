import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/globals/atoms/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/globals/atoms/dialog";
import {
  Copy,
  ListChecks,
  Loader2,
  PencilLine,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  getEvaluationCriteriaById,
  type EvaluationCriteriaDTO,
  type IdLike,
} from "@/services/evaluationCriteriaService";
import {
  useDeleteEvaluationCriteria,
  useUpdateEvaluationCriteria,
} from "@/hooks/useEvaluationCriteria";

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

type FormState = {
  id: IdLike;
  name: string;
  description: string;
  maxScore: number;
  weight: number;
};

interface EvaluationCriteriaDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  criteriaId: IdLike | null;
}

export default function EvaluationCriteriaDetailDialog({
  isOpen,
  onClose,
  criteriaId,
}: EvaluationCriteriaDetailDialogProps) {
  const [detail, setDetail] = useState<EvaluationCriteriaDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<FormState | null>(null);

  const { mutate: updateMutate, isPending: isSaving } =
    useUpdateEvaluationCriteria();
  const { mutate: deleteMutate, isPending: isDeleting } =
    useDeleteEvaluationCriteria();

  useEffect(() => {
    if (!isOpen || criteriaId === null || criteriaId === undefined) return;
    setLoading(true);
    setErrorMsg(null);
    setDetail(null);
    setIsEditing(false);
    getEvaluationCriteriaById(criteriaId)
      .then((d) => {
        setDetail(d);
        setForm({
          id: d.id,
          name: d.name,
          description: d.description || "",
          maxScore: d.maxScore,
          weight: d.weight,
        });
      })
      .catch((err: unknown) => {
        const msg =
          err instanceof Error ? err.message : "Không thể tải dữ liệu";
        setErrorMsg(msg);
      })
      .finally(() => setLoading(false));
  }, [isOpen, criteriaId]);

  const onChange = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));

  const canSave = useMemo(() => {
    if (!form) return false;
    const validName = form.name.trim().length > 0;
    const validMax = Number.isFinite(form.maxScore) && form.maxScore > 0;
    const validWeight = Number.isFinite(form.weight) && form.weight >= 0;
    return validName && validMax && validWeight;
  }, [form]);

  const isDirty = useMemo(() => {
    if (!form || !detail) return false;
    return (
      form.name !== detail.name ||
      (form.description || "") !== (detail.description || "") ||
      form.maxScore !== detail.maxScore ||
      form.weight !== detail.weight
    );
  }, [form, detail]);

  const handleSave = () => {
    if (!form) return;
    updateMutate(
      {
        id: form.id,
        name: form.name.trim(),
        description: form.description.trim(),
        maxScore: form.maxScore,
        weight: form.weight,
      },
      {
        onSuccess: async () => {
          setLoading(true);
          try {
            const fresh = await getEvaluationCriteriaById(form.id);
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
      },
    );
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
      `Xóa tiêu chí "${detail.name}"? Hành động này không thể hoàn tác.`,
    );
    if (!ok) return;
    deleteMutate(detail.id, {
      onSuccess: () => {
        toast.success("Đã xóa tiêu chí");
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
      <DialogContent className="w-[880px] max-w-[96vw] overflow-hidden p-0">
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
                <ListChecks className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-[18px] font-semibold">
                  {isEditing ? "Chỉnh sửa tiêu chí" : "Chi tiết tiêu chí"}
                </DialogTitle>
                <DialogDescription className="text-[12px] text-white/80">
                  {isEditing
                    ? "Cập nhật thông tin tiêu chí đánh giá."
                    : "Xem thông tin chi tiết tiêu chí đánh giá."}
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
                {Array.from({ length: 4 }).map((_, i) => (
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
                <Row label="Mã tiêu chí">
                  <div className="flex items-center gap-2">
                    <div className="font-mono text-sm font-medium text-neutral-900">
                      #{detail.id}
                    </div>
                    <button
                      className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 px-2 py-1 text-[11px] text-neutral-700 transition-colors hover:bg-neutral-50"
                      onClick={() =>
                        handleCopy(String(detail.id), "mã tiêu chí")
                      }
                      title="Sao chép mã"
                    >
                      <Copy className="h-3.5 w-3.5" /> Sao chép
                    </button>
                  </div>
                </Row>
                <div className="border-t" />
                <Row label="Tên tiêu chí">
                  {!isEditing ? (
                    <div className="text-sm font-medium text-neutral-900">
                      {detail.name ?? "--"}
                    </div>
                  ) : (
                    <FieldInput
                      value={form?.name ?? ""}
                      onChange={(e) => onChange("name", e.target.value)}
                      placeholder="VD: Originality, Feasibility..."
                      maxLength={200}
                    />
                  )}
                </Row>
                <div className="border-t" />
                <Row label="Mô tả" hint="Mô tả ngắn gọn về cách chấm điểm">
                  {!isEditing ? (
                    <div className="text-sm text-neutral-800">
                      {detail.description || "—"}
                    </div>
                  ) : (
                    <FieldInput
                      value={form?.description ?? ""}
                      onChange={(e) => onChange("description", e.target.value)}
                      placeholder="Mô tả ngắn"
                      maxLength={500}
                    />
                  )}
                </Row>
              </Section>

              <Section title="Thiết lập điểm">
                <Row label="Điểm tối đa">
                  {!isEditing ? (
                    <Pill>{detail.maxScore}</Pill>
                  ) : (
                    <FieldInput
                      type="number"
                      value={form?.maxScore ?? 0}
                      onChange={(e) =>
                        onChange("maxScore", Number(e.target.value || 0))
                      }
                      min={1}
                      className="w-[220px]"
                    />
                  )}
                </Row>
                <div className="border-t" />
                <Row label="Trọng số (%)" hint="0–100">
                  {!isEditing ? (
                    <Pill>{detail.weight}</Pill>
                  ) : (
                    <FieldInput
                      type="number"
                      value={form?.weight ?? 0}
                      onChange={(e) =>
                        onChange("weight", Number(e.target.value || 0))
                      }
                      min={0}
                      max={100}
                      className="w-[220px]"
                    />
                  )}
                </Row>
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
                      name: detail.name,
                      description: detail.description || "",
                      maxScore: detail.maxScore,
                      weight: detail.weight,
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
