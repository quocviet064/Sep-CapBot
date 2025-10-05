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
  CalendarRange,
  Loader2,
  Save,
  X,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { useCreateSemester, useSemesters } from "@/hooks/useSemester";
import type { CreateSemesterDTO } from "@/services/semesterService";

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

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-12 items-start gap-4 py-3">
      <div className="col-span-4 sm:col-span-3">
        <div className="text-[11px] font-semibold tracking-wide text-neutral-500 uppercase">
          {label}
        </div>
      </div>
      <div className="col-span-8 sm:col-span-9">{children}</div>
    </div>
  );
}

interface SemesterCreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type TermType = "Summer" | "Fall" | "Spring";

export default function SemesterCreateDialog({
  isOpen,
  onClose,
}: SemesterCreateDialogProps) {
  const currentYear = String(new Date().getFullYear());
  const [term, setTerm] = useState<TermType>("Summer");
  const [year, setYear] = useState<string>(currentYear);
  const [form, setForm] = useState<CreateSemesterDTO>({
    name: "",
    startDate: "",
    endDate: "",
    description: "",
  });

  const { data: semesters = [] } = useSemesters();

  const {
    mutate: createMutate,
    isPending: isSaving,
    isSuccess,
    reset,
  } = useCreateSemester();

  useEffect(() => {
    setForm((p) => ({ ...p, name: `${term} ${year}`.trim() }));
  }, [term, year]);

  const isDuplicate = useMemo(() => {
    const name = form.name.trim().toLowerCase();
    if (!name) return false;
    return semesters.some((s) => (s.name || "").trim().toLowerCase() === name);
  }, [form.name, semesters]);

  const canSave = useMemo(() => {
    const nameOk = form.name.trim().length >= 3;
    const datesOk =
      !!form.startDate &&
      !!form.endDate &&
      new Date(form.startDate) <= new Date(form.endDate);
    return nameOk && datesOk && !isDuplicate;
  }, [form.name, form.startDate, form.endDate, isDuplicate]);

  const handleClose = () => {
    reset();
    setTerm("Summer");
    setYear(currentYear);
    setForm({ name: "", startDate: "", endDate: "", description: "" });
    onClose();
  };

  useEffect(() => {
    if (!isOpen) reset();
  }, [isOpen, reset]);

  useEffect(() => {
    if (isSuccess) {
      toast.success("Đã tạo học kỳ");
      handleClose();
    }
  }, [isSuccess]);

  const incYear = () => {
    const y = parseInt(year || currentYear, 10);
    const next = isNaN(y) ? parseInt(currentYear, 10) + 1 : y + 1;
    setYear(String(Math.min(9999, next)));
  };

  const decYear = () => {
    const y = parseInt(year || currentYear, 10);
    const next = isNaN(y) ? parseInt(currentYear, 10) - 1 : y - 1;
    setYear(String(Math.max(0, next)));
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => (!open ? handleClose() : null)}
    >
      <DialogContent className="w=[720px] max-w-[96vw] overflow-hidden p-0">
        <div className="relative">
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-indigo-600 to-violet-600" />
          <div
            className="absolute inset-0 -z-10 opacity-60"
            style={{
              backgroundImage:
                "radial-gradient(900px 300px at -10% -40%, rgba(255,255,255,.35), transparent 60%), radial-gradient(700px 260px at 110% -30%, rgba(255,255,255,.25), transparent 60%)",
            }}
          />
          <div className="flex items-center justify-between px-6 py-5 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20 backdrop-blur">
                <CalendarRange className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-[18px] font-semibold">
                  Tạo học kỳ
                </DialogTitle>
                <DialogDescription className="text-[12px] text-white/80">
                  Nhập thông tin học kỳ và lưu lại.
                </DialogDescription>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5 bg-neutral-50 px-6 py-6">
          <div className="rounded-2xl border border-neutral-200/70 bg-white/80 px-5 py-4 shadow-sm ring-1 ring-black/5 backdrop-blur">
            <Row label="Tên học kỳ">
              <div className="flex flex-nowrap items-center gap-3 whitespace-nowrap">
                <FieldSelect
                  value={term}
                  onChange={(e) => setTerm(e.target.value as TermType)}
                  className={[
                    "w-[160px]",
                    isDuplicate
                      ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-200/60"
                      : "",
                  ].join(" ")}
                >
                  <option value="Summer">Summer</option>
                  <option value="Fall">Fall</option>
                  <option value="Spring">Spring</option>
                </FieldSelect>

                <div className="relative w-[140px]">
                  <FieldInput
                    inputMode="numeric"
                    value={year}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D+/g, "").slice(0, 4);
                      setYear(v);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowUp") {
                        e.preventDefault();
                        incYear();
                      }
                      if (e.key === "ArrowDown") {
                        e.preventDefault();
                        decYear();
                      }
                    }}
                    placeholder="YYYY"
                    className={[
                      "pr-8 text-center",
                      isDuplicate
                        ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-200/60"
                        : "",
                    ].join(" ")}
                  />
                  <div className="pointer-events-auto absolute inset-y-0 right-1 flex w-6 flex-col items-center justify-center gap-1">
                    <button
                      type="button"
                      onClick={incYear}
                      className="inline-flex h-4 w-4 items-center justify-center rounded hover:bg-neutral-100 active:scale-95"
                      aria-label="Tăng năm"
                    >
                      <ChevronUp className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={decYear}
                      className="inline-flex h-4 w-4 items-center justify-center rounded hover:bg-neutral-100 active:scale-95"
                      aria-label="Giảm năm"
                    >
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>

              {isDuplicate && (
                <div className="mt-2 text-xs font-medium text-red-600">
                  Tên học kỳ <span className="font-semibold">{form.name}</span>{" "}
                  đã tồn tại. Vui lòng chọn kỳ khác hoặc đổi năm.
                </div>
              )}
            </Row>

            <div className="border-t" />
            <Row label="Xu hướng">
              <FieldTextarea
                rows={4}
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Nhập mô tả học kỳ (không bắt buộc)"
              />
            </Row>
            <div className="border-t" />
            <Row label="Ngày bắt đầu">
              <FieldInput
                type="date"
                value={form.startDate}
                onChange={(e) =>
                  setForm((p) => ({ ...p, startDate: e.target.value }))
                }
                max={form.endDate || undefined}
                className="w-[220px]"
              />
            </Row>
            <div className="border-t" />
            <Row label="Ngày kết thúc">
              <FieldInput
                type="date"
                value={form.endDate}
                onChange={(e) =>
                  setForm((p) => ({ ...p, endDate: e.target.value }))
                }
                min={form.startDate || undefined}
                className="w-[220px]"
              />
            </Row>
          </div>
        </div>

        <DialogFooter className="sticky bottom-0 z-10 border-t bg-white/85 px-6 py-4 backdrop-blur">
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSaving}
              className="gap-2"
            >
              <X className="h-4 w-4" /> Đóng
            </Button>
            <Button
              onClick={() => createMutate(form)}
              disabled={!canSave || isSaving}
              className="gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Đang tạo...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Tạo học kỳ
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
