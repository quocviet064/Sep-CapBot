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
import { formatDateTime } from "@/utils/formatter";
import { TopicDetailResponse } from "@/services/topicService";

interface TopicDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  data: TopicDetailResponse | null;
  onUpdate?: (updated: TopicDetailResponse) => void;
}

function TopicDetailDialog({ isOpen, onClose, data }: TopicDetailDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [objectives, setObjectives] = useState("");
  const [categoryId, setCategoryId] = useState<number>(0);

  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (data) {
      setTitle(data.title);
      setDescription(data.description);
      setObjectives(data.objectives);
      setCategoryId(data.categoryId);
    }
  }, [data]);

  if (!data) return null;
  const current = data.currentVersion;

  const InfoBlock = ({
    label,
    children,
  }: {
    label: string;
    children: React.ReactNode;
  }) => (
    <div className="space-y-1">
      <Label className="text-sm font-semibold text-gray-700">{label}</Label>
      <div className="bg-muted rounded-md px-4 py-2 text-sm whitespace-pre-line text-gray-800">
        {children || <span className="text-gray-400 italic">--</span>}
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] min-w-[900px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>🎓 Chi tiết đề tài đồ án</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Chỉnh sửa thông tin cơ bản của đề tài."
              : "Xem thông tin tổng thể và nội dung phiên bản hiện tại của đề tài."}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 grid grid-cols-2 gap-6">
          <div className="col-span-2">
            <h3 className="text-primary text-base font-semibold">
              📘 Thông tin chung
            </h3>
          </div>

          {isEditing ? (
            <>
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Tiêu đề</Label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded border px-3 py-2 text-sm"
                />
              </div>

              <InfoBlock label="Giảng viên hướng dẫn">
                {data.supervisorName}
              </InfoBlock>

              <div className="space-y-1">
                <Label className="text-sm font-semibold">Danh mục (ID)</Label>
                <input
                  type="number"
                  value={categoryId}
                  onChange={(e) => setCategoryId(Number(e.target.value))}
                  className="w-full rounded border px-3 py-2 text-sm"
                />
              </div>

              <InfoBlock label="Học kỳ">{data.semesterName}</InfoBlock>

              <div className="col-span-2 space-y-1">
                <Label className="text-sm font-semibold">Tóm tắt đề tài</Label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded border px-3 py-2 text-sm"
                  rows={3}
                />
              </div>

              <div className="col-span-2 space-y-1">
                <Label className="text-sm font-semibold">Mục tiêu</Label>
                <textarea
                  value={objectives}
                  onChange={(e) => setObjectives(e.target.value)}
                  className="w-full rounded border px-3 py-2 text-sm"
                  rows={3}
                />
              </div>

              {/* <div className="space-y-1">
                <Label className="text-sm font-semibold">
                  Số lượng SV tối đa
                </Label>
                <input
                  type="number"
                  value={maxStudents}
                  onChange={(e) => setMaxStudents(Number(e.target.value))}
                  className="w-full rounded border px-3 py-2 text-sm"
                  min={1}
                />
              </div> */}
            </>
          ) : (
            <>
              <InfoBlock label="Tiêu đề">{title}</InfoBlock>
              <InfoBlock label="Danh mục">{data.categoryName}</InfoBlock>
              <InfoBlock label="Học kỳ">{data.semesterName}</InfoBlock>
              <InfoBlock label="Tóm tắt đề tài">{description}</InfoBlock>
              <InfoBlock label="Mục tiêu">{objectives}</InfoBlock>
              {/* <InfoBlock label="Số lượng SV tối đa">{maxStudents}</InfoBlock> */}
            </>
          )}

          <InfoBlock label="Ngày tạo">
            {formatDateTime(data.createdAt)}
          </InfoBlock>

          <div className="col-span-2 border-b pt-4" />

          {current && (
            <>
              <div className="col-span-2">
                <h3 className="text-primary mt-2 text-base font-semibold">
                  📝 Nội dung phiên bản hiện tại
                </h3>
              </div>

              <InfoBlock label="Phương pháp">{current.methodology}</InfoBlock>
              <InfoBlock label="Kết quả mong đợi">
                {current.expectedOutcomes}
              </InfoBlock>
              <InfoBlock label="Yêu cầu">{current.requirements}</InfoBlock>
              <InfoBlock label="Tài liệu đính kèm">
                {current.documentUrl ? (
                  <a
                    href={current.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    {current.documentUrl}
                  </a>
                ) : (
                  "--"
                )}
              </InfoBlock>
              <InfoBlock label="Ngày tạo phiên bản">
                {formatDateTime(current.createdAt)}
              </InfoBlock>
            </>
          )}
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default TopicDetailDialog;
