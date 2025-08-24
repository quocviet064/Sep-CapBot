// src/components/category/category-create-dialog.tsx
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/globals/atoms/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/globals/atoms/dialog";
import { BookOpen, Loader2, Save, X } from "lucide-react";
import { toast } from "sonner";
import { useCreateCategory } from "@/hooks/useCategory";
import type { CreateCategoryPayload } from "@/services/categoryService";
import { motion } from "framer-motion";

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

type CreateForm = {
  name: string;
  description: string;
};

export default function CategoryCreateDialog({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [form, setForm] = useState<CreateForm>({ name: "", description: "" });
  const { mutate: createMutate, isPending: isSaving } = useCreateCategory();

  const onChange = <K extends keyof CreateForm>(key: K, value: CreateForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const isDirty = useMemo(() => !!form.name || !!form.description, [form]);

  const canSave = useMemo(() => {
    return !!form.name.trim() && !!form.description.trim();
  }, [form]);

  const resetForm = () => setForm({ name: "", description: "" });

  const closeOrConfirm = () => {
    if (isDirty) {
      const ok = window.confirm("Bạn có thay đổi chưa lưu. Đóng hộp thoại?");
      if (!ok) return;
    }
    onClose();
  };

  const handleSave = () => {
    if (!canSave) return;
    const payload: CreateCategoryPayload = {
      name: form.name.trim(),
      description: form.description.trim(),
    };
    createMutate(payload, {
      onSuccess: () => {
        toast.success("Tạo danh mục thành công");
        resetForm();
        onClose();
      },
      onError: (e: unknown) => {
        const msg = e instanceof Error ? e.message : "Tạo danh mục thất bại";
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
                  Tạo danh mục mới
                </DialogTitle>
                <DialogDescription className="text-[12px] text-white/80">
                  Nhập thông tin danh mục (tên, mô tả) rồi lưu để tạo mới.
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
            <Section title="Thông tin danh mục">
              <Row label="Tên danh mục">
                <FieldInput
                  value={form.name}
                  onChange={(e) => onChange("name", e.target.value)}
                  placeholder="VD: Khoa học dữ liệu"
                  maxLength={200}
                />
              </Row>
              <div className="border-t" />
              <Row label="Mô tả" hint="Mô tả ngắn gọn phạm vi của danh mục.">
                <FieldTextarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => onChange("description", e.target.value)}
                  placeholder="Nhập mô tả danh mục"
                />
              </Row>
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
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Đang tạo...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" /> Tạo danh mục
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
