// src/pages/moderators/reviewer-assignment/SubmissionDetailDialog.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/globals/atoms/dialog";
import { Button } from "@/components/globals/atoms/button";
import { useSubmissionDetail } from "@/hooks/useSubmission";
import DataTableDate from "@/components/globals/molecules/data-table-date";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  submissionId?: string | number;
}

export default function SubmissionDetailDialog({ isOpen, onClose, submissionId }: Props) {
  const { data, isLoading, error } = useSubmissionDetail(submissionId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Chi tiết submission</DialogTitle>
          <DialogDescription>
            {submissionId ? `#${submissionId}` : "—"}
          </DialogDescription>
        </DialogHeader>

        {isLoading && <div className="text-sm text-muted-foreground">Đang tải…</div>}
        {error && <div className="text-sm text-red-600">Không tải được chi tiết</div>}

        {!isLoading && !error && data && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-3 gap-2">
              <span className="text-muted-foreground">ID</span>
              <span className="col-span-2 font-medium">{String(data.id)}</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <span className="text-muted-foreground">Supervisor</span>
              <span className="col-span-2">
                {data.submittedByName ? `${data.submittedByName}${data.submittedBy ? ` (#${data.submittedBy})` : ""}` : (data.submittedBy ? `#${data.submittedBy}` : "--")}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <span className="text-muted-foreground">Round</span>
              <span className="col-span-2">{data.submissionRound ?? 1}</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <span className="text-muted-foreground">Submitted at</span>
              <span className="col-span-2">
                <DataTableDate date={data.submittedAt} />
              </span>
            </div>

            {/* chỗ này có thể bổ sung thêm các field khác nếu BE trả về */}
          </div>
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
