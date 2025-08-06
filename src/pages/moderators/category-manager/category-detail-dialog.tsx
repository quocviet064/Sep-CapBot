import { useEffect, useState } from "react";
import { Button } from "@/components/globals/atoms/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/globals/atoms/dialog";
import { Label } from "@/components/globals/atoms/label";
import {
  useCategoryById,
  useUpdateCategory,
  useDeleteCategory,
} from "@/hooks/useCategory";
import { formatDateTime } from "@/utils/formatter";
import { toast } from "sonner";

interface CategoryDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: string | null;
  onUpdate?: () => void;
}

function CategoryDetailDialog({
  isOpen,
  onClose,
  categoryId,
  onUpdate,
}: CategoryDetailDialogProps) {
  const {
    data: categoryData,
    isLoading,
    error,
    refetch,
  } = useCategoryById(categoryId || "");

  const { mutateAsync: updateCategory } = useUpdateCategory();
  const { mutateAsync: deleteCategory } = useDeleteCategory();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (categoryData) {
      setName(categoryData.name);
      setDescription(categoryData.description);
    }
  }, [categoryData]);

  const handleSave = async () => {
    if (!categoryData) return;
    setIsUpdating(true);
    const toastId = toast.loading("Đang cập nhật...");

    try {
      await updateCategory({
        id: categoryData.id,
        name,
        description,
      });

      toast.success("✅ Cập nhật thành công!", { id: toastId });
      setIsEditing(false);
      refetch();
      onUpdate?.();
    } catch {
      toast.error("❌ Cập nhật thất bại!", { id: toastId });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!categoryData) return;

    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa danh mục "${categoryData.name}"?`,
    );

    if (!confirmed) return;

    const toastId = toast.loading("Đang xóa...");

    try {
      await deleteCategory(categoryData.id);
      toast.success("🗑️ Đã xóa danh mục!", { id: toastId });
      onUpdate?.();
      onClose();
    } catch (error) {
      toast.error("❌ Xóa thất bại!", { id: toastId });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-[700px]">
        <DialogHeader>
          <DialogTitle>Chi tiết danh mục</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Chỉnh sửa thông tin danh mục."
              : "Xem thông tin chi tiết của danh mục."}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div>Đang tải...</div>
        ) : error ? (
          <div className="text-red-500">Lỗi khi tải dữ liệu.</div>
        ) : categoryData ? (
          <div className="flex flex-col gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Tên danh mục</Label>
              {isEditing ? (
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded border px-3 py-2 text-sm"
                />
              ) : (
                <div className="bg-secondary rounded-sm px-4 py-2 text-sm font-medium">
                  {categoryData.name}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Mô tả</Label>
              {isEditing ? (
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded border px-3 py-2 text-sm"
                  rows={3}
                />
              ) : (
                <div className="bg-secondary rounded-sm px-4 py-2 text-sm font-medium">
                  {categoryData.description}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Số lượng đề tài</Label>
              <div className="bg-secondary rounded-sm px-4 py-2 text-sm font-medium">
                {categoryData.topicsCount}
              </div>
            </div>

            <div className="flex justify-between gap-4">
              <div className="w-full space-y-2">
                <Label className="text-sm font-medium">Ngày tạo</Label>
                <div className="bg-secondary rounded-sm px-4 py-2 text-sm font-medium">
                  {formatDateTime(categoryData.createdAt) || "Không có"}
                </div>
              </div>

              <div className="w-full space-y-2">
                <Label className="text-sm font-medium">Ngày cập nhật</Label>
                <div className="bg-secondary rounded-sm px-4 py-2 text-sm font-medium">
                  {formatDateTime(categoryData.lastModifiedAt) || "Không có"}
                </div>
              </div>
            </div>

            <div className="flex justify-between gap-4">
              <div className="w-full space-y-2">
                <Label className="text-sm font-medium">Người tạo</Label>
                <div className="bg-secondary rounded-sm px-4 py-2 text-sm font-medium">
                  {categoryData.createdBy}
                </div>
              </div>

              <div className="w-full space-y-2">
                <Label className="text-sm font-medium">Người cập nhật</Label>
                <div className="bg-secondary rounded-sm px-4 py-2 text-sm font-medium">
                  {categoryData.lastModifiedBy || "Không có"}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p>Không có dữ liệu danh mục.</p>
        )}

        <DialogFooter>
          {categoryData &&
            (isEditing ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => setIsEditing(false)}
                  disabled={isUpdating}
                >
                  Hủy
                </Button>
                <Button
                  variant="default"
                  onClick={handleSave}
                  disabled={isUpdating}
                >
                  {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  className="mr-2"
                >
                  Xóa
                </Button>
                <Button variant="default" onClick={() => setIsEditing(true)}>
                  Chỉnh sửa
                </Button>
              </>
            ))}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CategoryDetailDialog;
