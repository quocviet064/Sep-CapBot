import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/globals/atoms/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/globals/atoms/dialog";
import { Copy, Loader2, PencilLine, Save, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { formatDateTime } from "@/utils/formatter";
import {
  useCategoryById,
  useDeleteCategory,
  useUpdateCategory,
} from "@/hooks/useCategory";

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

interface CategoryDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: string | null;
  onUpdate?: () => void;
}

export default function CategoryDetailDialog({
  isOpen,
  onClose,
  categoryId,
  onUpdate,
}: CategoryDetailDialogProps) {
  const { data, isLoading, error, refetch } = useCategoryById(categoryId || "");
  const { mutateAsync: updateCategory, isPending: isSaving } =
    useUpdateCategory();
  const { mutateAsync: deleteCategory, isPending: isDeleting } =
    useDeleteCategory();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (isOpen) {
      setIsEditing(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (data) {
      setName(data.name || "");
      setDescription(data.description || "");
    } else {
      setName("");
      setDescription("");
    }
  }, [data]);

  const canSave = useMemo(() => {
    return !!name.trim();
  }, [name]);

  const handleSave = async () => {
    if (!data) return;
    try {
      await updateCategory({
        id: data.id,
        name: name.trim(),
        description: description.trim(),
      });
      toast.success("Đã cập nhật danh mục");
      setIsEditing(false);
      await refetch();
      onUpdate?.();
    } catch {
      toast.error("Cập nhật thất bại");
    }
  };

  const handleDelete = async () => {
    if (!data) return;
    const ok = window.confirm(`Xóa danh mục "${data.name}"?`);
    if (!ok) return;
    try {
      await deleteCategory(data.id);
      toast.success("Đã xóa danh mục");
      onUpdate?.();
      onClose();
    } catch {
      toast.error("Xóa thất bại");
    }
  };

  const handleCopy = (text: string, label?: string) => {
    navigator.clipboard.writeText(text);
    toast.success(label ? `Đã sao chép ${label}` : "Đã sao chép");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[760px] max-w-[96vw] overflow-hidden p-0">
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
                <PencilLine className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-[18px] font-semibold">
                  {isEditing ? "Chỉnh sửa danh mục" : "Chi tiết danh mục"}
                </DialogTitle>
                <DialogDescription className="text-[12px] text-white/80">
                  {isEditing
                    ? "Cập nhật tên và mô tả danh mục."
                    : "Xem thông tin chi tiết danh mục."}
                </DialogDescription>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5 bg-neutral-50 px-6 py-6">
          {isLoading ? (
            <div className="rounded-xl border border-neutral-200 bg-white/70 px-4 py-3 text-sm text-neutral-700">
              Đang tải...
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Lỗi khi tải dữ liệu
            </div>
          ) : !data ? (
            <div className="rounded-xl border border-dashed border-neutral-300 bg-white/50 px-6 py-10 text-center text-sm text-neutral-600">
              Không có dữ liệu
            </div>
          ) : (
            <div className="rounded-2xl border border-neutral-200/70 bg-white/80 px-5 py-4 shadow-sm ring-1 ring-black/5 backdrop-blur">
              <Row label="Mã danh mục">
                <div className="flex items-center gap-2">
                  <div className="font-mono text-sm font-medium text-neutral-900">
                    #{data.id}
                  </div>
                  <button
                    className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 px-2 py-1 text-[11px] text-neutral-700 transition-colors hover:bg-neutral-50"
                    onClick={() => handleCopy(String(data.id), "mã danh mục")}
                    title="Sao chép mã"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Sao chép
                  </button>
                </div>
              </Row>
              <div className="border-t" />
              <Row label="Tên danh mục">
                {isEditing ? (
                  <FieldInput
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nhập tên danh mục"
                  />
                ) : (
                  <div className="text-sm font-medium text-neutral-900">
                    {data.name || "--"}
                  </div>
                )}
              </Row>
              <div className="border-t" />
              <Row label="Mô tả">
                {isEditing ? (
                  <FieldTextarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Nhập mô tả"
                  />
                ) : (
                  <div className="text-sm text-neutral-700">
                    {data.description || "--"}
                  </div>
                )}
              </Row>
              <div className="border-t" />
              <Row label="Số lượng đề tài">
                <div className="text-sm text-neutral-900">
                  {data.topicsCount ?? 0}
                </div>
              </Row>
              <div className="border-t" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Row label="Ngày tạo">
                  <div className="text-sm text-neutral-900">
                    {formatDateTime(data.createdAt) || "—"}
                  </div>
                </Row>
                <Row label="Cập nhật">
                  <div className="text-sm text-neutral-900">
                    {formatDateTime(data.lastModifiedAt) || "—"}
                  </div>
                </Row>
                <Row label="Người tạo">
                  <div className="text-sm text-neutral-900">
                    {data.createdBy || "—"}
                  </div>
                </Row>
                <Row label="Người cập nhật">
                  <div className="text-sm text-neutral-900">
                    {data.lastModifiedBy || "—"}
                  </div>
                </Row>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="sticky bottom-0 z-10 border-t bg-white/85 px-6 py-4 backdrop-blur">
          {!isEditing ? (
            <div className="flex w-full items-center justify-between">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isSaving || isDeleting}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Đóng
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setIsEditing(true)}
                  disabled={isSaving || isDeleting}
                  className="gap-2"
                >
                  <PencilLine className="h-4 w-4" />
                  Chỉnh sửa
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDelete}
                  disabled={isSaving || isDeleting || !data}
                  className="gap-2 border-red-300 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Xóa
                </Button>
              </div>
            </div>
          ) : (
            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={isSaving || isDeleting}
              >
                Hủy
              </Button>
              <Button
                onClick={handleSave}
                disabled={!canSave || isSaving || isDeleting}
                className="gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Lưu thay đổi
                  </>
                )}
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
