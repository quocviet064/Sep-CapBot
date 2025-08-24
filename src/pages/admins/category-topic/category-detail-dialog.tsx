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
  fetchCategoryById,
  type UpdateCategoryPayload,
} from "@/services/categoryService";
import type { CategoryDetailType } from "@/schemas/categorySchema";
import {
  BookOpen,
  Copy,
  Loader2,
  PencilLine,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useDeleteCategory, useUpdateCategory } from "@/hooks/useCategory";
import { motion } from "framer-motion";
import { formatDateTime } from "@/utils/formatter";

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

type CategoryDetailFull = CategoryDetailType & {
  topicsCount?: number;
  createdAt?: string;
  createdBy?: string | null;
  lastModifiedAt?: string | null;
  lastModifiedBy?: string | null;
};

interface CategoryDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: string | null;
}

export default function CategoryDetailDialog({
  isOpen,
  onClose,
  categoryId,
}: CategoryDetailDialogProps) {
  const [detail, setDetail] = useState<CategoryDetailFull | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<UpdateCategoryPayload | null>(null);

  const { mutate: updateMutate, isPending: isSaving } = useUpdateCategory();
  const { mutate: deleteMutate, isPending: isDeleting } = useDeleteCategory();

  useEffect(() => {
    if (!isOpen || !categoryId) return;
    setLoading(true);
    setErrorMsg(null);
    setDetail(null);
    setIsEditing(false);
    fetchCategoryById(categoryId)
      .then((d) => {
        const full = d as CategoryDetailFull;
        setDetail(full);
        setForm({
          id: full.id,
          name: full.name,
          description: full.description,
        });
      })
      .catch((err: unknown) => {
        const msg =
          err instanceof Error ? err.message : "Không thể tải dữ liệu";
        setErrorMsg(msg);
      })
      .finally(() => setLoading(false));
  }, [isOpen, categoryId]);

  const onChange = (key: keyof UpdateCategoryPayload, value: string | number) =>
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));

  const canSave = useMemo(() => {
    if (!form) return false;
    return !!form.name?.trim() && !!form.description?.trim();
  }, [form]);

  const isDirty = useMemo(() => {
    if (!form || !detail) return false;
    return form.name !== detail.name || form.description !== detail.description;
  }, [form, detail]);

  const handleSave = () => {
    if (!form) return;
    updateMutate(form, {
      onSuccess: () => {
        setLoading(true);
        fetchCategoryById(String(form.id))
          .then((fresh) => {
            const full = fresh as CategoryDetailFull;
            setDetail(full);
            setIsEditing(false);
          })
          .catch((e: unknown) => {
            const msg =
              e instanceof Error ? e.message : "Không thể tải lại dữ liệu";
            setErrorMsg(msg);
          })
          .finally(() => setLoading(false));
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
      `Xóa danh mục "${detail.name}"? Hành động này không thể hoàn tác.`,
    );
    if (!ok) return;
    deleteMutate(Number(detail.id), {
      onSuccess: () => {
        toast.success("Đã xóa danh mục");
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
      <DialogContent className="w-[900px] max-w-[96vw] overflow-hidden p-0">
        <div className="relative">
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-indigo-600 to-violet-600" />
          <div
            className="absolute inset-0 -z-10 opacity-60"
            style={{
              backgroundImage:
                "radial-gradient(1100px 360px at -10% -40%, rgba(255,255,255,.35), transparent 60%), radial-gradient(800px 260px at 110% -30%, rgba(255,255,255,.25), transparent 60%)",
            }}
          />
          <div className="flex items-center justify-between px-6 py-5 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20 backdrop-blur">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-[18px] font-semibold">
                  {isEditing ? "Chỉnh sửa danh mục" : "Chi tiết danh mục"}
                </DialogTitle>
                <DialogDescription className="text-[12px] text-white/80">
                  {isEditing
                    ? "Cập nhật thông tin danh mục."
                    : "Xem thông tin chi tiết của danh mục."}
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
              <Section title="Thông tin danh mục">
                <Row label="Mã danh mục">
                  <div className="flex items-center gap-2">
                    <div className="font-mono text-sm font-medium text-neutral-900">
                      #{detail.id}
                    </div>
                    <button
                      className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 px-2 py-1 text-[11px] text-neutral-700 transition-colors hover:bg-neutral-50"
                      onClick={() =>
                        handleCopy(String(detail.id), "mã danh mục")
                      }
                      title="Sao chép mã"
                    >
                      <Copy className="h-3.5 w-3.5" /> Sao chép
                    </button>
                  </div>
                </Row>
                <div className="border-t" />
                <Row label="Tên danh mục">
                  {!isEditing ? (
                    <div className="text-sm font-medium text-neutral-900">
                      {detail.name ?? "--"}
                    </div>
                  ) : (
                    <FieldInput
                      value={form?.name ?? ""}
                      onChange={(e) => onChange("name", e.target.value)}
                      placeholder="VD: Trí tuệ nhân tạo"
                      maxLength={200}
                    />
                  )}
                </Row>
                <div className="border-t" />
                <Row label="Mô tả">
                  {!isEditing ? (
                    <div className="text-sm text-neutral-800">
                      {detail.description ?? "--"}
                    </div>
                  ) : (
                    <FieldTextarea
                      rows={4}
                      value={form?.description ?? ""}
                      onChange={(e) => onChange("description", e.target.value)}
                      placeholder="Nhập mô tả danh mục"
                    />
                  )}
                </Row>
                <div className="border-t" />
                <Row label="Số chủ đề">
                  <div className="text-sm font-medium text-neutral-900">
                    {typeof detail.topicsCount === "number"
                      ? detail.topicsCount
                      : 0}
                  </div>
                </Row>
              </Section>

              <Section title="Nhật ký thay đổi">
                <Row label="Ngày tạo">
                  <div className="text-sm">
                    {detail.createdAt ? formatDateTime(detail.createdAt) : "--"}
                  </div>
                </Row>
                <div className="border-t" />
                <Row label="Người tạo">
                  <div className="text-sm">{detail.createdBy ?? "--"}</div>
                </Row>
                <div className="border-t" />
                <Row label="Sửa lần cuối">
                  <div className="text-sm">
                    {detail.lastModifiedAt
                      ? formatDateTime(detail.lastModifiedAt)
                      : "--"}
                  </div>
                </Row>
                <div className="border-t" />
                <Row label="Bởi">
                  <div className="text-sm">{detail.lastModifiedBy ?? "--"}</div>
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
                      description: detail.description,
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
