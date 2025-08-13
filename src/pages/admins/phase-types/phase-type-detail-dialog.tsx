import { useEffect, useMemo, useState } from "react";
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
  usePhaseTypeById,
  useUpdatePhaseType,
  useDeletePhaseType,
} from "@/hooks/usePhaseType";
import { formatDateTime } from "@/utils/formatter";

interface PhaseTypeDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  phaseTypeId: string | null;
}

function PhaseTypeDetailDialog({
  isOpen,
  onClose,
  phaseTypeId,
}: PhaseTypeDetailDialogProps) {
  const {
    data: detail,
    isLoading,
    error,
  } = usePhaseTypeById(phaseTypeId || "", isOpen);

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  useEffect(() => {
    if (detail) {
      setName(detail.name ?? "");
      setDescription(detail.description ?? "");
    }
    if (!isOpen) setIsEditing(false);
  }, [detail, isOpen]);

  const { mutate: updateMutate, isPending: isSaving } = useUpdatePhaseType();
  const { mutate: deleteMutate, isPending: isDeleting } = useDeletePhaseType();

  const canSave = useMemo(
    () => !!name.trim() && !!phaseTypeId,
    [name, phaseTypeId],
  );

  const handleSave = () => {
    if (!phaseTypeId || !name.trim()) return;
    updateMutate(
      {
        id: Number(phaseTypeId),
        name: name.trim(),
        description: description?.trim() || null,
      },
      { onSuccess: () => setIsEditing(false) },
    );
  };

  const handleDelete = () => {
    if (!phaseTypeId) return;

    const ok = window.confirm("Bạn có chắc chắn muốn xóa loại giai đoạn này?");
    if (!ok) return;

    deleteMutate(phaseTypeId, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-[700px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Chỉnh sửa loại giai đoạn" : "Chi tiết loại giai đoạn"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Cập nhật thông tin loại giai đoạn."
              : "Xem thông tin chi tiết của loại giai đoạn."}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div>Đang tải...</div>
        ) : error ? (
          <div className="text-red-500">Lỗi khi tải dữ liệu.</div>
        ) : detail ? (
          <div className="flex flex-col gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Tên loại giai đoạn</Label>
              {isEditing ? (
                <input
                  className="w-full rounded-sm border px-4 py-2 text-sm"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nhập tên loại giai đoạn"
                />
              ) : (
                <div className="bg-secondary rounded-sm px-4 py-2 text-sm font-medium">
                  {detail.name}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Mô tả</Label>
              {isEditing ? (
                <textarea
                  className="w-full rounded-sm border px-4 py-2 text-sm"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Nhập mô tả"
                />
              ) : (
                <div className="bg-secondary rounded-sm px-4 py-2 text-sm">
                  {detail.description || "Không có"}
                </div>
              )}
            </div>

            {!isEditing && (
              <>
                <div className="flex justify-between gap-4">
                  <div className="w-full space-y-2">
                    <Label className="text-sm font-medium">Ngày tạo</Label>
                    <div className="bg-secondary rounded-sm px-4 py-2 text-sm">
                      {detail.createdAt
                        ? formatDateTime(detail.createdAt)
                        : "Không có"}
                    </div>
                  </div>
                  <div className="w-full space-y-2">
                    <Label className="text-sm font-medium">Ngày cập nhật</Label>
                    <div className="bg-secondary rounded-sm px-4 py-2 text-sm">
                      {detail.updatedAt
                        ? formatDateTime(detail.updatedAt)
                        : "Không có"}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between gap-4">
                  <div className="w-full space-y-2">
                    <Label className="text-sm font-medium">Người tạo</Label>
                    <div className="bg-secondary rounded-sm px-4 py-2 text-sm">
                      {detail.createdBy || "Không có"}
                    </div>
                  </div>
                  <div className="w-full space-y-2">
                    <Label className="text-sm font-medium">
                      Người cập nhật
                    </Label>
                    <div className="bg-secondary rounded-sm px-4 py-2 text-sm">
                      {detail.updatedBy || "Không có"}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <p>Không có dữ liệu loại giai đoạn.</p>
        )}

        <DialogFooter className="gap-2">
          {isEditing ? (
            <Button
              variant="outline"
              onClick={() => {
                if (detail) {
                  setName(detail.name ?? "");
                  setDescription(detail.description ?? "");
                }
                setIsEditing(false);
              }}
              disabled={isSaving || isDeleting}
            >
              Huỷ
            </Button>
          ) : (
            <Button variant="outline" onClick={onClose} disabled={isDeleting}>
              Đóng
            </Button>
          )}

          {!isEditing && detail && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Đang xóa..." : "Xóa"}
            </Button>
          )}

          {detail && !isEditing && (
            <Button onClick={() => setIsEditing(true)} disabled={isDeleting}>
              Chỉnh sửa
            </Button>
          )}
          {isEditing && (
            <Button
              onClick={handleSave}
              disabled={!canSave || isSaving || isDeleting}
            >
              {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default PhaseTypeDetailDialog;
