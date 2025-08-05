import { useEffect, useState, KeyboardEvent } from "react";
import LoadingPage from "@/pages/loading-page";
import { useTopicDetail, useApproveTopic } from "@/hooks/useTopicDetail";
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
import { Button } from "@/components/globals/atoms/button";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/utils/formatter";
import { CircleCheckBig, CircleX } from "lucide-react";

interface TopicDetailDialogProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly topicId: string;
}

export default function TopicDetailDialog({
  isOpen,
  onClose,
  topicId,
}: TopicDetailDialogProps) {
  const { data: topic, isLoading: detailLoading } = useTopicDetail(topicId);
  const { mutate, status: approveStatus } = useApproveTopic();

  const [selectedApproval, setSelectedApproval] = useState<boolean>(false);
  const [note, setNote] = useState<string>("");

  useEffect(() => {
    if (topic) {
      setSelectedApproval(topic.isApproved);
      setNote(topic.currentVersion?.requirements || "");
    }
  }, [topic]);

  if (detailLoading) return <LoadingPage />;
  if (!topic)
    return <p className="p-4 text-center text-red-600">Không tìm thấy đề tài</p>;

  const isApproving = approveStatus === "pending";
  const isChanged = selectedApproval !== topic.isApproved;

  const onKeyToggle = (
    e: KeyboardEvent<HTMLDivElement>,
    value: boolean
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setSelectedApproval(value);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-[700px]">
        <DialogHeader>
          <DialogTitle>Chi tiết đề tài #{topic.id}</DialogTitle>
          <DialogDescription>
            Xem & xử lý xét duyệt đề tài
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6">
          {/* Tiêu đề */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Tiêu đề</Label>
            <div className="bg-secondary rounded-sm px-4 py-2 text-sm font-medium">
              {topic.currentVersion.title}
            </div>
          </div>

          {/* Giảng viên */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Giảng viên hướng dẫn</Label>
            <div className="bg-secondary rounded-sm px-4 py-2 text-sm font-medium">
              {topic.supervisorName}
            </div>
          </div>

          {/* Mô tả */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Mô tả</Label>
            <div className="bg-secondary rounded-sm px-4 py-2 text-sm font-medium">
              {topic.currentVersion.description}
            </div>
          </div>

          {/* Quyết định duyệt */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Quyết định duyệt</Label>

            <div
              role="button"
              tabIndex={0}
              onClick={() => setSelectedApproval(true)}
              onKeyDown={(e) => onKeyToggle(e, true)}
              className={cn(
                "flex items-center gap-4 rounded-sm border px-4 py-2 text-sm font-medium hover:cursor-pointer",
                selectedApproval === true ? "bg-secondary" : ""
              )}
            >
              <CircleCheckBig size={16} color="green" />
              <div className="flex items-center gap-1">
                <p>Duyệt đề tài</p>
                <span className="font-light">
                  - Chuyển sang bước phân công Reviewer
                </span>
              </div>
            </div>

            <div
              role="button"
              tabIndex={0}
              onClick={() => setSelectedApproval(false)}
              onKeyDown={(e) => onKeyToggle(e, false)}
              className={cn(
                "flex items-center gap-4 rounded-sm border px-4 py-2 text-sm font-medium hover:cursor-pointer",
                selectedApproval === false ? "bg-secondary" : ""
              )}
            >
              <CircleX size={16} color="red" />
              <div className="flex items-center gap-1">
                <p>Từ chối đề tài</p>
                <span className="font-light">
                  - Trả lại Supervisor để chỉnh sửa
                </span>
              </div>
            </div>
          </div>

          {/* Ghi chú */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Ghi chú</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={selectedApproval}
              placeholder="Ghi chú sẽ hiển thị cho giảng viên hướng dẫn"
            />
          </div>

          {/* Ngày tạo / Ngày cập nhật */}
          <div className="flex justify-between gap-4">
            <div className="w-full space-y-2">
              <Label className="text-sm font-medium">Ngày tạo</Label>
              <div className="bg-secondary rounded-sm px-4 py-2 text-sm font-medium">
                {formatDateTime(topic.createdAt)}
              </div>
            </div>
            <div className="w-full space-y-2">
              <Label className="text-sm font-medium">Ngày cập nhật</Label>
              <div className="bg-secondary rounded-sm px-4 py-2 text-sm font-medium">
                {topic.lastModifiedAt
                  ? formatDateTime(topic.lastModifiedAt)
                  : "--"}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
          <Button
            variant="default"
            onClick={() =>
              mutate(Number(topicId), {
                onSuccess: onClose,
              })
            }
            disabled={!isChanged || isApproving}
          >
            {isApproving ? "Đang xử lý..." : "Xác nhận"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
