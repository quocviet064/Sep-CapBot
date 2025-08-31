import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/globals/atoms/dialog";
import DataTableDate from "@/components/globals/molecules/data-table-date";
import { type SubmissionType } from "@/services/submissionService";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  submission?: SubmissionType;
}

export default function SubmissionDetailDialog({ isOpen, onClose, submission }: Props) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[720px]">
        <DialogHeader>
          <DialogTitle>
            Chi tiết submission {submission?.id ? `(#${submission.id})` : ""}
          </DialogTitle>
        </DialogHeader>

        {!submission ? (
          <div className="p-2 text-sm text-gray-500">Không có dữ liệu.</div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-gray-500">Submission ID</div>
                <div className="font-medium">#{String(submission.id)}</div>
              </div>
              <div>
                <div className="text-gray-500">Supervisor</div>
                <div className="font-medium">
                  {submission.submittedByName
                    ? `${submission.submittedByName}${submission.submittedBy ? ` (#${submission.submittedBy})` : ""}`
                    : submission.submittedBy ? `#${submission.submittedBy}` : "--"}
                </div>
              </div>
              <div>
                <div className="text-gray-500">Round</div>
                <div className="font-medium">{submission.submissionRound ?? 1}</div>
              </div>
              <div>
                <div className="text-gray-500">Submitted at</div>
                <div className="font-medium">
                  <DataTableDate date={submission.submittedAt} />
                </div>
              </div>
            </div>

            {/* Nếu BE có thêm các field như documentUrl / additionalNotes thì show ở đây */}
            {typeof (submission as any).documentUrl === "string" && (
              <div className="text-sm">
                <div className="text-gray-500 mb-1">Document URL</div>
                <a
                  href={(submission as any).documentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline break-all"
                >
                  {(submission as any).documentUrl}
                </a>
              </div>
            )}
            {typeof (submission as any).additionalNotes === "string" &&
              (submission as any).additionalNotes && (
                <div className="text-sm">
                  <div className="text-gray-500 mb-1">Ghi chú</div>
                  <div className="whitespace-pre-wrap">
                    {(submission as any).additionalNotes}
                  </div>
                </div>
              )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
