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
import { formatDate } from "@/utils/formatter";
import { toast } from "sonner";
import {
  useSemesterById,
  useUpdateSemester,
  useDeleteSemester,
} from "@/hooks/useSemester";

const toDateInput = (iso?: string) => (iso ? iso.slice(0, 10) : "");

interface Props {
  isOpen: boolean;
  onClose: () => void;
  semesterId: string | null;
  onUpdate?: () => void;
}

export default function SemesterDetailDialog({
  isOpen,
  onClose,
  semesterId,
  onUpdate,
}: Props) {
  const { data, isLoading, error, refetch } = useSemesterById(semesterId || "");
  const { mutateAsync: updateSemester } = useUpdateSemester();
  const { mutateAsync: deleteSemester } = useDeleteSemester();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isWorking, setIsWorking] = useState(false);

  useEffect(() => {
    if (data) {
      setName(data.name);
      setStartDate(toDateInput(data.startDate));
      setEndDate(toDateInput(data.endDate));
    }
  }, [data]);

  const handleSave = async () => {
    if (!data) return;
    if (!name || !startDate || !endDate) {
      toast.error("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    setIsWorking(true);
    const tid = toast.loading("Đang cập nhật...");
    try {
      await updateSemester({
        id: data.id,
        name,
        startDate, // YYYY-MM-DD
        endDate,   // YYYY-MM-DD
      });
      toast.success("✅ Cập nhật thành công!", { id: tid });
      setIsEditing(false);
      await refetch();
      onUpdate?.();
    } catch (e) {
      toast.error("❌ Cập nhật thất bại!", { id: tid });
    } finally {
      setIsWorking(false);
    }
  };

  const handleDelete = async () => {
    if (!data) return;
    const confirmed = window.confirm(`Xóa học kỳ "${data.name}"?`);
    if (!confirmed) return;

    const tid = toast.loading("Đang xóa...");
    try {
      await deleteSemester(data.id);
      toast.success("🗑️ Đã xóa học kỳ!", { id: tid });
      onUpdate?.();
      onClose();
    } catch {
      toast.error("❌ Xóa thất bại!", { id: tid });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-[700px]">
        <DialogHeader>
          <DialogTitle>Chi tiết học kỳ</DialogTitle>
          <DialogDescription>
            {isEditing ? "Chỉnh sửa thông tin học kỳ." : "Xem thông tin chi tiết của học kỳ."}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div>Đang tải...</div>
        ) : error ? (
          <div className="text-red-500">Lỗi khi tải dữ liệu.</div>
        ) : data ? (
          <div className="flex flex-col gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Tên học kỳ</Label>
              {isEditing ? (
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded border px-3 py-2 text-sm"
                />
              ) : (
                <div className="bg-secondary rounded-sm px-4 py-2 text-sm font-medium">
                  {data.name}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Ngày bắt đầu</Label>
                {isEditing ? (
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded border px-3 py-2 text-sm"
                  />
                ) : (
                  <div className="bg-secondary rounded-sm px-4 py-2 text-sm font-medium">
                    {formatDate(data.startDate)}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Ngày kết thúc</Label>
                {isEditing ? (
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded border px-3 py-2 text-sm"
                  />
                ) : (
                  <div className="bg-secondary rounded-sm px-4 py-2 text-sm font-medium">
                    {formatDate(data.endDate)}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between gap-4">
              <div className="w-full space-y-2">
                <Label className="text-sm font-medium">Ngày tạo</Label>
                <div className="bg-secondary rounded-sm px-4 py-2 text-sm font-medium">
                  {formatDate(data.createdAt) || "Không có"}
                </div>
              </div>

              <div className="w-full space-y-2">
                <Label className="text-sm font-medium">Ngày cập nhật</Label>
                <div className="bg-secondary rounded-sm px-4 py-2 text-sm font-medium">
                  {formatDate(data.updatedAt) || "Không có"}
                </div>
              </div>
            </div>

            <div className="flex justify-between gap-4">
              <div className="w-full space-y-2">
                <Label className="text-sm font-medium">Người tạo</Label>
                <div className="bg-secondary rounded-sm px-4 py-2 text-sm font-medium">
                  {data.createdBy || "--"}
                </div>
              </div>

              <div className="w-full space-y-2">
                <Label className="text-sm font-medium">Người cập nhật</Label>
                <div className="bg-secondary rounded-sm px-4 py-2 text-sm font-medium">
                  {data.updatedBy || "--"}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p>Không có dữ liệu học kỳ.</p>
        )}

        <DialogFooter>
          {data &&
            (isEditing ? (
              <>
                <Button variant="ghost" onClick={() => setIsEditing(false)} disabled={isWorking}>
                  Hủy
                </Button>
                <Button variant="default" onClick={handleSave} disabled={isWorking}>
                  {isWorking ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </>
            ) : (
              <>
                <Button variant="destructive" onClick={handleDelete} className="mr-2">
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
