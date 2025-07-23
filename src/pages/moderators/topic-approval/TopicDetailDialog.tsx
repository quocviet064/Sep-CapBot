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
import { Textarea } from "@/components/globals/atoms/textarea";
import { topicDataEx } from "@/constants/data/topic";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/utils/formatter";
import { CircleCheckBig, CircleX } from "lucide-react";
import { useEffect, useState } from "react";

interface TopicDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  topicId: string | null;
}

function TopicDetailDialog({
  isOpen,
  onClose,
  topicId,
}: TopicDetailDialogProps) {
  const topic = topicDataEx.find((item) => item.id === topicId);

  const [selectedApproval, setSelectedApproval] = useState<boolean>(false);

  useEffect(() => {
    if (topic) {
      setSelectedApproval(topic.isApproved);
    }
  }, [topic]);

  const isChanged =
    selectedApproval !== null && selectedApproval !== topic?.isApproved;

  const handleSelectApprove = () => {
    setSelectedApproval(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-[700px]">
        <DialogHeader>
          <DialogTitle>Chi tiết đề tài</DialogTitle>
          <DialogDescription>
            Xem thông tin chi tiết của đề tài.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Tiêu đề</Label>
            <div className="bg-secondary rounded-sm px-4 py-2 text-sm font-medium">
              {topic?.title}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Giảng viên hướng dẫn</Label>
            <div className="bg-secondary rounded-sm px-4 py-2 text-sm font-medium">
              {topic?.supervisor}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Tóm tắt đề tài</Label>
            <div className="bg-secondary rounded-sm px-4 py-2 text-sm font-medium">
              {topic?.description}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Quyết định duyệt</Label>

            <div
              onClick={handleSelectApprove}
              className={cn(
                "flex items-center gap-4 rounded-sm border px-4 py-2 text-sm font-medium hover:cursor-pointer",
                selectedApproval === true ? "bg-secondary" : "",
              )}
            >
              <CircleCheckBig size={16} color="green" />
              <div className="flex items-center gap-1">
                <p>Duyệt đề tài</p>
                <span className="font-light">
                  - Chuyển sang bước phân công người đánh giá
                </span>
              </div>
            </div>

            <div
              className={cn(
                "flex items-center gap-4 rounded-sm border px-4 py-2 text-sm font-medium hover:cursor-pointer",
                selectedApproval === false ? "bg-secondary" : "",
              )}
            >
              <CircleX size={16} color="red" />
              <div className="flex items-center gap-1">
                <p>Từ chối đề tài</p>
                <span className="font-light">
                  - Trả lại giảng viên hướng dẫn để chỉnh sửa
                </span>
              </div>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Ghi chú</Label>

            <Textarea
              disabled={selectedApproval}
              placeholder="Ghi chú về đề tài (sẽ hiển thị cho giảng viên hướng dẫn)"
            />
          </div>

          <div className="flex justify-between gap-4">
            <div className="w-full space-y-2">
              <Label className="text-sm font-medium">Ngày tạo</Label>
              <div className="bg-secondary rounded-sm px-4 py-2 text-sm font-medium">
                {formatDateTime(topic?.createdAt)}
              </div>
            </div>

            <div className="w-full space-y-2">
              <Label className="text-sm font-medium">Ngày cập nhật</Label>
              <div className="bg-secondary rounded-sm px-4 py-2 text-sm font-medium">
                {formatDateTime(topic?.updatedAt)}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>

          <Button disabled={!isChanged} variant="default">
            Xác nhận
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default TopicDetailDialog;
