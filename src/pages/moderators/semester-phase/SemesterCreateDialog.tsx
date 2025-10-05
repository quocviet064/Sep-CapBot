import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/globals/atoms/dialog";
import { Input } from "@/components/globals/atoms/input";
import { Button } from "@/components/globals/atoms/button";
import { useCreateSemester } from "@/hooks/useSemester";
import { toast } from "sonner";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export default function SemesterCreateDialog({
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const { mutateAsync: createSemester, isPending } = useCreateSemester();

  const handleCreate = async () => {
    if (!name.trim() || !startDate || !endDate || !description.trim()) {
      toast.error("Vui lòng nhập đủ tên, ngày bắt đầu/kết thúc và mô tả.");
      return;
    }
    const tid = toast.loading("Đang tạo học kỳ...");
    try {
      await createSemester({
        name: name.trim(),
        startDate,
        endDate,
        description: description.trim(),
      });
      toast.success("Tạo học kỳ thành công!", { id: tid });
      onClose();
      onSuccess?.();
      setName("");
      setStartDate("");
      setEndDate("");
      setDescription("");
    } catch {
      toast.error("Tạo học kỳ thất bại!", { id: tid });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-[600px]">
        <DialogHeader>
          <DialogTitle>Tạo học kỳ mới</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Tên học kỳ (VD: Fall 2025)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm">Ngày bắt đầu</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm">Ngày kết thúc</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <Input
            placeholder="Mô tả học kỳ"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleCreate} disabled={isPending}>
            {isPending ? "Đang tạo..." : "Tạo học kỳ"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
