import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { getTopicDetail, TopicDetailResponse } from "@/services/topicService";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  topicId: string | null;
};

function TopicDetailDialog({ isOpen, onClose, topicId }: Props) {
  const { data, isFetching, isError, error, refetch } = useQuery<
    TopicDetailResponse,
    Error
  >({
    queryKey: ["topicDetail", topicId],
    queryFn: () => getTopicDetail(Number(topicId)),
    enabled: isOpen && !!topicId,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (isOpen && topicId) refetch();
  }, [isOpen, topicId, refetch]);

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
            Xem thông tin tổng thể và nội dung phiên bản hiện tại của đề tài.
          </DialogDescription>
        </DialogHeader>

        {isFetching && (
          <div className="px-2 py-6 text-sm text-gray-500">
            Đang tải chi tiết đề tài...
          </div>
        )}

        {isError && (
          <div className="px-2 py-6 text-sm text-red-600">
            Không thể tải chi tiết đề tài. {error?.message}
          </div>
        )}

        {!isFetching && !isError && !data && (
          <div className="px-2 py-6 text-sm text-gray-500">
            Không có dữ liệu chi tiết cho đề tài này.
          </div>
        )}

        {data && (
          <div className="mt-2 grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <h3 className="text-primary text-base font-semibold">
                📘 Thông tin chung
              </h3>
            </div>

            <InfoBlock label="Tiêu đề">{data.title}</InfoBlock>
            <InfoBlock label="Giảng viên hướng dẫn">
              {data.supervisorName}
            </InfoBlock>

            <InfoBlock label="Danh mục">{data.categoryName}</InfoBlock>
            <InfoBlock label="Học kỳ">{data.semesterName}</InfoBlock>

            <InfoBlock label="Tóm tắt đề tài">{data.description}</InfoBlock>
            <InfoBlock label="Mục tiêu">{data.objectives}</InfoBlock>

            <InfoBlock label="Số SV tối đa">{data.maxStudents}</InfoBlock>
            <InfoBlock label="Trạng thái">
              {data.isApproved ? "Đã duyệt" : "Chưa duyệt"}
            </InfoBlock>

            <InfoBlock label="Ngày tạo">
              {formatDateTime(data.createdAt)}
            </InfoBlock>
            <InfoBlock label="Người tạo">{data.createdBy}</InfoBlock>

            <div className="col-span-2 border-b pt-2" />

            <div className="col-span-2">
              <h3 className="text-primary mt-2 text-base font-semibold">
                📝 Nội dung phiên bản hiện tại
              </h3>
            </div>

            <InfoBlock label="Phương pháp">
              {data.currentVersion?.methodology}
            </InfoBlock>
            <InfoBlock label="Kết quả mong đợi">
              {data.currentVersion?.expectedOutcomes}
            </InfoBlock>
            <InfoBlock label="Yêu cầu">
              {data.currentVersion?.requirements}
            </InfoBlock>

            <InfoBlock label="Tài liệu đính kèm">
              {data.currentVersion?.documentUrl ? (
                <a
                  href={data.currentVersion.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  {data.currentVersion.documentUrl}
                </a>
              ) : (
                "--"
              )}
            </InfoBlock>

            <InfoBlock label="Ngày tạo phiên bản">
              {formatDateTime(data.currentVersion?.createdAt)}
            </InfoBlock>
            <InfoBlock label="Người tạo phiên bản">
              {data.currentVersion?.createdBy}
            </InfoBlock>
          </div>
        )}

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
