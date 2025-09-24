// src/pages/admin/evaluation/EvaluationCriteriaCreateDialog.tsx
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/globals/atoms/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/globals/atoms/dialog";
import { BookOpen, Info, Loader2, Save, X } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useCreateCriteria } from "@/hooks/useEvaluationCriteria";
import type { CreateCriteriaPayload } from "@/services/evaluationCriteriaService";
import { useSemesters } from "@/hooks/useSemester";

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

function FieldInput({
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  return (
    <>
      <input
        {...props}
        className={[
          "w-full rounded-xl border px-3.5 py-2.5 text-sm",
          error
            ? "border-rose-300 focus:border-rose-400 focus:ring-4 focus:ring-rose-200/60"
            : "border-neutral-200 bg-white shadow-inner outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-200/60",
          props.className || "",
        ].join(" ")}
        aria-invalid={!!error}
        aria-describedby={error ? `${props.name}-error` : undefined}
      />
      {error && (
        <p
          id={`${props.name}-error`}
          className="mt-1 text-xs font-medium text-rose-600"
        >
          {error}
        </p>
      )}
    </>
  );
}

function FieldTextarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  return (
    <textarea
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

type CreateForm = {
  name: string;
  description: string;
  maxScore: number | "";
  weight: number | "";
  semesterId: number | "";
  notes: string;
};

export default function EvaluationCriteriaCreateDialog({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [form, setForm] = useState<CreateForm>({
    name: "",
    description: "",
    maxScore: 100,
    weight: 10,
    semesterId: "",
    notes: "",
  });

  const { mutate: createMutate, isPending: isSaving } = useCreateCriteria();
  const {
    data: semesters,
    isLoading: semLoading,
    error: semError,
  } = useSemesters();

  const onChange = <K extends keyof CreateForm>(key: K, value: CreateForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    if (!semLoading && semesters?.length && form.semesterId === "") {
      onChange("semesterId", semesters[0].id as number);
    }
  }, [semesters, semLoading]);

  useEffect(() => {
    if (semError) toast.error(semError.message);
  }, [semError]);

  const parsedMax =
    typeof form.maxScore === "number" ? form.maxScore : Number.NaN;
  const parsedWeight =
    typeof form.weight === "number" ? form.weight : Number.NaN;
  const parsedSemester =
    typeof form.semesterId === "number" ? form.semesterId : Number.NaN;

  const maxScoreError =
    Number.isNaN(parsedMax) || parsedMax <= 0
      ? "Điểm tối đa phải là số dương"
      : parsedMax > 100
        ? "Điểm tối đa không được vượt quá 100"
        : "";

  const weightError = Number.isNaN(parsedWeight)
    ? "Trọng số phải là số hợp lệ"
    : parsedWeight <= 0
      ? "Trọng số phải lớn hơn 0"
      : "";

  const nameError = !form.name.trim() ? "Tên tiêu chí là bắt buộc" : "";

  const isDirty = useMemo(
    () =>
      !!form.name ||
      !!form.description ||
      !!form.notes ||
      form.maxScore !== 100 ||
      form.weight !== 10 ||
      form.semesterId !== "",
    [form],
  );

  const canSave = useMemo(() => {
    const noErrors = !nameError && !maxScoreError && !weightError;
    return noErrors && Number.isFinite(parsedSemester) && parsedSemester > 0;
  }, [nameError, maxScoreError, weightError, parsedSemester]);

  const resetForm = () =>
    setForm({
      name: "",
      description: "",
      maxScore: 100,
      weight: 10,
      semesterId: semesters?.length ? (semesters[0].id as number) : "",
      notes: "",
    });

  const closeOrConfirm = () => {
    if (isDirty) {
      const ok = window.confirm("Bạn có thay đổi chưa lưu. Đóng hộp thoại?");
      if (!ok) return;
    }
    onClose();
  };

  const handleSave = () => {
    if (!canSave) return;
    const payload: CreateCriteriaPayload = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      maxScore: parsedMax,
      weight: parsedWeight,
      semesterId: parsedSemester,
    };
    createMutate(payload, {
      onSuccess: () => {
        toast.success("Tạo tiêu chí thành công");
        resetForm();
        onClose();
      },
      onError: (e: unknown) => {
        const msg = e instanceof Error ? e.message : "Tạo tiêu chí thất bại";
        toast.error(msg);
      },
    });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (!isSaving && canSave) handleSave();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isSaving, canSave]);

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
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-[18px] font-semibold">
                  Tạo tiêu chí đánh giá
                </DialogTitle>
                <DialogDescription className="text-[12px] text-white/80">
                  Nhập thông tin tiêu chí: tên, mô tả, điểm tối đa, trọng số và
                  học kỳ.
                </DialogDescription>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5 bg-neutral-50 px-6 py-6">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
            className="grid grid-cols-1 gap-5"
          >
            <Section title="Thông tin tiêu chí">
              <Row label="Tên tiêu chí">
                <FieldInput
                  name="name"
                  value={form.name}
                  onChange={(e) => onChange("name", e.target.value)}
                  placeholder="VD: Tính đúng đắn"
                  maxLength={200}
                  error={nameError}
                />
              </Row>
              <div className="border-t" />
              <Row label="Mô tả" hint="Mô tả ngắn gọn tiêu chí đánh giá.">
                <FieldTextarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => onChange("description", e.target.value)}
                  placeholder="Nhập mô tả tiêu chí"
                />
              </Row>
              <div className="border-t" />
              <Row label="Học kỳ">
                <FieldSelect
                  value={form.semesterId === "" ? "" : String(form.semesterId)}
                  onChange={(e) =>
                    onChange(
                      "semesterId",
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                  disabled={semLoading || !semesters?.length}
                >
                  <option value="" disabled>
                    {semLoading
                      ? "Đang tải ..."
                      : semesters?.length
                        ? "Chọn học kỳ"
                        : "Không có học kỳ"}
                  </option>
                  {(semesters ?? []).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </FieldSelect>
              </Row>
              <Row label="Điểm tối đa">
                <FieldInput
                  name="maxScore"
                  type="number"
                  min={1}
                  max={100}
                  step={1}
                  inputMode="numeric"
                  value={form.maxScore}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (raw === "") {
                      onChange("maxScore", "");
                      return;
                    }
                    const normalized = raw.replace(",", ".");
                    const rounded = Math.round(Number.parseFloat(normalized));
                    if (Number.isNaN(rounded)) {
                      onChange("maxScore", "");
                      return;
                    }
                    const clamped = Math.min(100, Math.max(1, rounded));
                    onChange("maxScore", clamped);
                  }}
                  placeholder="Ví dụ: 100"
                  error={maxScoreError}
                />
              </Row>

              <Row label="Trọng số">
                <FieldInput
                  name="weight"
                  type="number"
                  min={0.01}
                  step="0.01"
                  value={form.weight}
                  onChange={(e) =>
                    onChange(
                      "weight",
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                  placeholder="Ví dụ: 10"
                  error={weightError}
                />
                <div className="mt-2 inline-flex items-start gap-2 rounded-lg border border-indigo-200 bg-indigo-50/60 px-3 py-2 text-[12px] text-indigo-900">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>
                    Quy ước: <b>Điểm tối đa ≤ 100</b> và <b>Trọng số &gt; 0</b>.
                    Trọng số nên phản ánh mức độ quan trọng của tiêu chí trong
                    tổng điểm.
                  </span>
                </div>
              </Row>

              <div className="border-t" />
            </Section>
          </motion.div>
        </div>

        <DialogFooter className="sticky bottom-0 z-10 border-t bg-white/85 px-6 py-4 backdrop-blur">
          <div className="flex w-full items-center justify-between">
            <div>
              <Button
                variant="outline"
                onClick={closeOrConfirm}
                disabled={isSaving}
                className="gap-2"
              >
                <X className="h-4 w-4" /> Đóng
              </Button>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="outline"
                onClick={resetForm}
                disabled={isSaving || !isDirty}
              >
                Làm mới
              </Button>
              <Button
                onClick={handleSave}
                disabled={!canSave || isSaving}
                className="gap-2"
                title={
                  !canSave ? "Vui lòng sửa các lỗi trước khi lưu" : undefined
                }
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Đang tạo...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" /> Tạo tiêu chí
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>

        {isSaving && (
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-white/50">
            <div className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-700 shadow-sm">
              <Loader2 className="h-4 w-4 animate-spin" /> Đang tạo...
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
