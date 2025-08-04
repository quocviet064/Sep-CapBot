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
import { useCategoryById } from "@/hooks/useCategory";
import { formatDateTime } from "@/utils/formatter";

interface CategoryDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: string | null;
}

function CategoryDetailDialog({
  isOpen,
  onClose,
  categoryId,
}: CategoryDetailDialogProps) {
  const {
    data: categoryData,
    isLoading: isCategoryLoading,
    error: categoryError,
  } = useCategoryById(categoryId || "");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-[700px]">
        <DialogHeader>
          <DialogTitle>Chi tiết danh mục</DialogTitle>
          <DialogDescription>
            Xem thông tin chi tiết của danh mục.
          </DialogDescription>
        </DialogHeader>

        {isCategoryLoading ? (
          <div>Đang tải...</div>
        ) : categoryError ? (
          <div className="text-red-500">Lỗi khi tải dữ liệu.</div>
        ) : categoryData ? (
          <div className="flex flex-col gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Tên danh mục</Label>
              <div className="bg-secondary rounded-sm px-4 py-2 text-sm font-medium">
                {categoryData.name}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Mô tả</Label>
              <div className="bg-secondary rounded-sm px-4 py-2 text-sm font-medium">
                {categoryData.description}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Số lượng đề tài</Label>
              <div className="bg-secondary rounded-sm px-4 py-2 text-sm font-medium">
                {categoryData.topicsCount}
              </div>
            </div>

            <div className="flex justify-between gap-4">
              <div className="w-full space-y-2">
                <Label className="text-sm font-medium">Ngày cập nhật</Label>
                <div className="bg-secondary rounded-sm px-4 py-2 text-sm font-medium">
                  {formatDateTime(categoryData.lastModifiedAt) || "Không có"}
                </div>
              </div>

              <div className="w-full space-y-2">
                <Label className="text-sm font-medium">Người cập nhật</Label>
                <div className="bg-secondary rounded-sm px-4 py-2 text-sm font-medium">
                  {categoryData.lastModifiedBy || "Không có"}
                </div>
              </div>
            </div>

            <div className="flex justify-between gap-4">
              <div className="w-full space-y-2">
                <Label className="text-sm font-medium">Người tạo</Label>
                <div className="bg-secondary rounded-sm px-4 py-2 text-sm font-medium">
                  {formatDateTime(categoryData.createdAt)}
                </div>
              </div>

              <div className="w-full space-y-2">
                <Label className="text-sm font-medium">Người cập nhật</Label>
                <div className="bg-secondary rounded-sm px-4 py-2 text-sm font-medium">
                  {categoryData.createdBy}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p>Không có dữ liệu danh mục.</p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CategoryDetailDialog;
