import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/globals/atoms/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/globals/atoms/dialog";
import { motion } from "framer-motion";
import { Loader2, Send, X } from "lucide-react";
import type { TopicListItem } from "@/services/topicService";
import { createThenSubmitSubmission } from "@/services/submissionService";
import { toast } from "sonner";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200/70 bg-white/80 shadow-sm ring-1 ring-black/5 backdrop-blur">
      <div className="flex items-center justify-between border-b px-5 py-3">
        <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function Row({
  label,
  children,
  stack,
}: {
  label: string;
  children: React.ReactNode;
  stack?: boolean;
}) {
  if (stack) {
    return (
      <div className="py-3">
        <div className="text-[11px] font-semibold tracking-wide text-neutral-500 uppercase">
          {label}
        </div>
        <div className="mt-2">{children}</div>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-12 items-start gap-4 py-3">
      <div className="col-span-4 sm:col-span-3">
        <div className="text-[11px] font-semibold tracking-wide text-neutral-500 uppercase">
          {label}
        </div>
      </div>
      <div className="col-span-8 sm:col-span-9">{children}</div>
    </div>
  );
}

function FieldTextarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  return (
    <textarea
      {...props}
      className={[
        "w-full rounded-xl border px-3.5 py-2.5 text-sm",
        "border-neutral-200 bg-white shadow-inner outline-none",
        "focus:border-indigo-400 focus:ring-4 focus:ring-indigo-200/60",
        "resize-y",
        props.className || "",
      ].join(" ")}
    />
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="h-4 w-40 animate-pulse rounded bg-neutral-200" />
      <div className="mt-3 grid grid-cols-12 items-center gap-4">
        <div className="col-span-4 sm:col-span-3">
          <div className="h-2.5 w-24 animate-pulse rounded bg-neutral-200" />
        </div>
        <div className="col-span-8 sm:col-span-9">
          <div className="h-10 w-full animate-pulse rounded-xl bg-neutral-200" />
        </div>
      </div>
      <div className="mt-3 grid grid-cols-12 items-center gap-4">
        <div className="col-span-4 sm:col-span-3">
          <div className="h-2.5 w-24 animate-pulse rounded bg-neutral-200" />
        </div>
        <div className="col-span-8 sm:col-span-9">
          <div className="h-10 w-full animate-pulse rounded-xl bg-neutral-200" />
        </div>
      </div>
    </div>
  );
}

type Props = {
  isOpen: boolean;
  onClose: () => void;
  topic: TopicListItem | null;
  defaultPhaseId?: number;
  defaultPhaseName?: string;
  onSuccess?: () => void;
};

export default function SubmitTopicDialog({
  isOpen,
  onClose,
  topic,
  defaultPhaseId,
  defaultPhaseName,
  onSuccess,
}: Props) {
  const [searchParams] = useSearchParams();
  const phaseIdFromURL = searchParams.get("phaseId");

  const resolvedPhaseId = useMemo(() => {
    if (typeof defaultPhaseId === "number" && !Number.isNaN(defaultPhaseId)) {
      return defaultPhaseId;
    }
    const pid = phaseIdFromURL ? Number(phaseIdFromURL) : undefined;
    return pid && !Number.isNaN(pid) ? pid : undefined;
  }, [defaultPhaseId, phaseIdFromURL]);

  const [additionalNotes, setAdditionalNotes] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const loading = false;

  useEffect(() => {
    if (!isOpen) return;
    setAdditionalNotes("");
  }, [isOpen, topic?.id, resolvedPhaseId]);

  const canSubmit = useMemo(() => {
    return !!topic && !!resolvedPhaseId && !submitting;
  }, [topic, resolvedPhaseId, submitting]);

  const confirm = async () => {
    if (!topic) return;
    if (!resolvedPhaseId) {
      toast.error(
        "Thiếu phaseId của giai đoạn. Vui lòng quay lại chọn giai đoạn.",
      );
      return;
    }
    setSubmitting(true);
    try {
      await createThenSubmitSubmission({
        topicId: topic.id,
        phaseId: resolvedPhaseId,
        documentUrl: null,
        additionalNotes: additionalNotes || "",
      });
      toast.success("Nộp đề tài thành công");
      await onSuccess?.();
      onClose();
    } catch (e: unknown) {
      const msg =
        e instanceof Error ? e.message : "Có lỗi xảy ra khi nộp đề tài";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="w-[900px] max-w-[96vw] overflow-hidden p-0">
        <div className="relative">
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-indigo-600 to-violet-600" />
          <div
            className="absolute inset-0 -z-10 opacity-60"
            style={{
              backgroundImage:
                "radial-gradient(1100px 360px at -10% -40%, rgba(255,255,255,.35), transparent 60%), radial-gradient(800px 260px at 110% -30%, rgba(255,255,255,.25), transparent 60%)",
            }}
          />
          <div className="flex items-center justify-between px-6 py-5 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20 backdrop-blur">
                <Send className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-[18px] font-semibold">
                  Nộp đề tài
                </DialogTitle>
                <DialogDescription className="text-[12px] text-white/80">
                  Tạo submission và nộp trong một bước.
                </DialogDescription>
              </div>
            </div>
            <button
              className="inline-flex items-center gap-1 rounded-lg border border-white/30 bg-white/10 px-2 py-1 text-sm text-white hover:bg-white/20"
              onClick={onClose}
            >
              <X className="h-4 w-4" /> Đóng
            </button>
          </div>
        </div>

        <div className="space-y-5 bg-neutral-50 px-6 py-6">
          {loading ? (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : !topic ? (
            <div className="rounded-xl border border-dashed border-neutral-300 bg-white/50 px-6 py-10 text-center text-sm text-neutral-600">
              Chưa chọn đề tài.
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className="grid grid-cols-1 gap-5 lg:grid-cols-2"
            >
              <Section title="Thông tin đề tài">
                <div className="border-t" />
                <Row label="Tên tiếng Việt">
                  <div className="text-sm font-medium text-neutral-900">
                    {topic.vN_title || "--"}
                  </div>
                </Row>
                <div className="border-t" />
                <Row label="Tên tiếng Anh">
                  <div className="text-sm text-neutral-800">
                    {topic.eN_Title || "--"}
                  </div>
                </Row>
                <div className="border-t" />
                <Row label="Học kỳ">
                  <div className="text-sm font-medium text-neutral-900">
                    {topic.semesterName || "--"}
                  </div>
                </Row>
              </Section>

              <Section title="Thông tin nộp">
                <Row label="Giai đoạn">
                  <div className="text-sm font-semibold text-neutral-900">
                    {defaultPhaseName || "--"}
                  </div>
                </Row>
                <div className="border-t" />
                <Row label="Ghi chú" stack>
                  <FieldTextarea
                    rows={3}
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    placeholder="Ghi chú bổ sung"
                  />
                </Row>
              </Section>
            </motion.div>
          )}
        </div>

        <DialogFooter className="sticky bottom-0 z-10 border-t bg-white/85 px-6 py-4 backdrop-blur">
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" onClick={onClose} disabled={submitting}>
              Huỷ
            </Button>
            <Button onClick={confirm} disabled={!canSubmit} className="gap-2">
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Đang nộp...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" /> Xác nhận nộp
                </>
              )}
            </Button>
          </div>
        </DialogFooter>

        {submitting && (
          <div className="absolute inset-0 z-20 grid place-items-center">
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm" />
            <div className="relative z-10 flex flex-col items-center gap-3 rounded-2xl border border-indigo-100 bg-white/90 px-5 py-4 shadow-lg">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
              <div className="text-sm font-medium text-neutral-800">
                Đang xử lý...
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
