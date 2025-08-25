import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/globals/atoms/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/globals/atoms/dialog";
import { ListChecks, Loader2, Save, X } from "lucide-react";
import { toast } from "sonner";
import { useCreateEvaluationCriteria } from "@/hooks/useEvaluationCriteria";
import type { CreateEvaluationCriteriaDTO } from "@/services/evaluationCriteriaService";

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

interface EvaluationCriteriaCreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EvaluationCriteriaCreateDialog({
  isOpen,
  onClose,
}: EvaluationCriteriaCreateDialogProps) {
  const [form, setForm] = useState<CreateEvaluationCriteriaDTO>({
    name: "",
    description: "",
    maxScore: 100,
    weight: 10,
  });

  const {
    mutate: createMutate,
    isPending: isSaving,
    isSuccess,
  } = useCreateEvaluationCriteria();

  const canSave = useMemo(() => {
    const validName = form.name.trim().length > 0;
    const validMax = Number.isFinite(form.maxScore) && form.maxScore > 0;
    const validWeight =
      Number.isFinite(form.weight) && form.weight >= 0 && form.weight <= 100;
    return validName && validMax && validWeight;
  }, [form]);

  useEffect(() => {
    if (!isOpen) {
      setForm({ name: "", description: "", maxScore: 100, weight: 10 });
    }
  }, [isOpen]);

  useEffect(() => {
    if (isSuccess) {
      toast.success("Đã tạo tiêu chí");
      onClose();
    }
  }, [isSuccess, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[720px] max-w-[96vw] overflow-hidden p-0">
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
                <ListChecks className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-[18px] font-semibold">
                  Tạo tiêu chí đánh giá
                </DialogTitle>
                <DialogDescription className="text-[12px] text-white/80">
                  Nhập thông tin tiêu chí và lưu lại.
                </DialogDescription>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5 bg-neutral-50 px-6 py-6">
          <div className="rounded-2xl border border-neutral-200/70 bg-white/80 px-5 py-4 shadow-sm ring-1 ring-black/5 backdrop-blur">
            <Row label="Tên tiêu chí">
              <FieldInput
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="VD: Originality"
                maxLength={200}
              />
            </Row>
            <div className="border-t" />
            <Row label="Mô tả">
              <FieldTextarea
                rows={4}
                value={form.description || ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Mô tả ngắn cho tiêu chí"
              />
            </Row>
            <div className="border-t" />
            <Row label="Điểm tối đa">
              <FieldInput
                type="number"
                value={form.maxScore}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    maxScore: Number(e.target.value || 0),
                  }))
                }
                min={1}
                className="w-[220px]"
              />
            </Row>
            <div className="border-t" />
            <Row label="Trọng số (%)">
              <FieldInput
                type="number"
                value={form.weight}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    weight: Number(e.target.value || 0),
                  }))
                }
                min={0}
                max={100}
                className="w-[220px]"
              />
            </Row>
          </div>
        </div>

        <DialogFooter className="sticky bottom-0 z-10 border-t bg-white/85 px-6 py-4 backdrop-blur">
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
              className="gap-2"
            >
              <X className="h-4 w-4" /> Đóng
            </Button>
            <Button
              onClick={() =>
                createMutate({
                  name: form.name.trim(),
                  description: (form.description || "").trim(),
                  maxScore: form.maxScore,
                  weight: form.weight,
                })
              }
              disabled={!canSave || isSaving}
              className="gap-2"
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
