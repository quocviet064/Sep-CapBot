import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/globals/atoms/dialog";
import { Input } from "@/components/globals/atoms/input";
import { Textarea } from "@/components/globals/atoms/textarea";
import { Button } from "@/components/globals/atoms/button";
import { useCreateCategory } from "@/hooks/useCategory";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CategoryCreateDialog({
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const { mutateAsync: createCategory, isLoading } = useCreateCategory();

  const handleCreate = async () => {
    if (!name) {
      toast.error("Vui lòng nhập tên danh mục.");
      return;
    }

    const toastId = toast.loading("Đang tạo danh mục...");
    try {
      await createCategory({ name, description });
      toast.success("🎉 Tạo danh mục thành công!", { id: toastId });
      onClose();
      onSuccess?.();
    } catch {
      toast.error("❌ Tạo danh mục thất bại!", { id: toastId });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-[600px]">
        <DialogHeader>
          <DialogTitle>Tạo danh mục đề tài mới</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Tên danh mục"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Textarea
            placeholder="Ghi chú / mô tả"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleCreate} disabled={isLoading}>
            {isLoading ? "Đang tạo..." : "Tạo danh mục"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
