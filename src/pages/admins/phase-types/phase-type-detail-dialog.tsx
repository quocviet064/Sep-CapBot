import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/globals/atoms/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/globals/atoms/dialog";
import {
  usePhaseTypeById,
  useUpdatePhaseType,
  useDeletePhaseType,
} from "@/hooks/usePhaseType";
import { formatDateTime } from "@/utils/formatter";
import { Loader2, PencilLine, Save, Trash2, X, Copy, Tag } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

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
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="grid grid-cols-[240px,1fr] items-center gap-4 py-3 md:grid-cols-[260px,1fr] lg:grid-cols-[280px,1fr]">
      <div className="min-w-0">
        <div
          className="text-[11px] font-semibold tracking-wide whitespace-nowrap text-neutral-500 uppercase"
          title={label}
        >
          {label}
        </div>
        {hint && <p className="mt-1 text-[11px] text-neutral-500">{hint}</p>}
      </div>
      <div className="min-w-0 overflow-hidden whitespace-nowrap">
        {children}
      </div>
    </div>
  );
}

function FieldInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={[
        "w-full rounded-xl border px-3.5 py-2.5 text-sm",
        "border-neutral-200 bg-white shadow-inner outline-none",
        "focus:border-indigo-400 focus:ring-4 focus:ring-indigo-200/60",
        props.className || "",
      ].join(" ")}
    />
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
        props.className || "",
      ].join(" ")}
    />
  );
}

function SkeletonRow() {
  return (
    <div className="grid grid-cols-[240px,1fr] items-center gap-4 py-3 md:grid-cols-[260px,1fr] lg:grid-cols-[280px,1fr]">
      <div>
        <div className="h-2.5 w-24 animate-pulse rounded bg-neutral-200" />
      </div>
      <div className="h-7 w-full animate-pulse rounded-xl bg-neutral-200" />
    </div>
  );
}

const handleCopy = (text: string, label?: string) => {
  navigator.clipboard.writeText(text);
  toast.success(label ? `Đã sao chép ${label}` : "Đã sao chép");
};

interface PhaseTypeDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  phaseTypeId: string | null;
}

function PhaseTypeDetailDialog({
  isOpen,
  onClose,
  phaseTypeId,
}: PhaseTypeDetailDialogProps) {
  const {
    data: detail,
    isLoading,
    error,
  } = usePhaseTypeById(phaseTypeId || "", isOpen);

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  useEffect(() => {
    if (detail) {
      setName(detail.name ?? "");
      setDescription(detail.description ?? "");
    }
    if (!isOpen) setIsEditing(false);
  }, [detail, isOpen]);

  const { mutate: updateMutate, isPending: isSaving } = useUpdatePhaseType();
  const { mutate: deleteMutate, isPending: isDeleting } = useDeletePhaseType();

  const canSave = useMemo(
    () => !!name.trim() && !!phaseTypeId,
    [name, phaseTypeId],
  );

  const isDirty = useMemo(() => {
    if (!detail) return !!name || !!description;
    return (
      (name ?? "") !== (detail.name ?? "") ||
      (description ?? "") !== (detail.description ?? "")
    );
  }, [name, description, detail]);

  const handleSave = () => {
    if (!phaseTypeId || !name.trim()) return;
    updateMutate(
      {
        id: Number(phaseTypeId),
        name: name.trim(),
        description: description?.trim() || null,
      },
      { onSuccess: () => setIsEditing(false) },
    );
  };

  const handleDelete = () => {
    if (!phaseTypeId) return;
    const ok = window.confirm("Bạn có chắc chắn muốn xóa loại giai đoạn này?");
    if (!ok) return;
    deleteMutate(phaseTypeId, { onSuccess: () => onClose() });
  };

  const closeOrConfirm = () => {
    if (isEditing && isDirty) {
      const ok = window.confirm(
        "Bạn có thay đổi chưa lưu. Bạn có chắc muốn đóng?",
      );
      if (!ok) return;
    }
    onClose();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!isEditing) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (!isSaving && canSave) handleSave();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isEditing, isSaving, canSave]);

  return (
    <Dialog open={isOpen} onOpenChange={closeOrConfirm}>
      <DialogContent className="w-[1200px] max-w-[98vw] overflow-hidden p-0">
        <div className="relative">
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-indigo-600 to-violet-600" />
          <div
            className="absolute inset-0 -z-10 opacity-60"
            style={{
              backgroundImage:
                "radial-gradient(1200px 400px at -10% -40%, rgba(255,255,255,.35), transparent 60%), radial-gradient(900px 300px at 110% -30%, rgba(255,255,255,.25), transparent 60%)",
            }}
          />
          <div className="flex items-center justify-between px-6 py-5 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20 backdrop-blur">
                <Tag className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-[18px] font-semibold">
                  {isEditing
                    ? "Chỉnh sửa loại giai đoạn"
                    : "Chi tiết loại giai đoạn"}
                </DialogTitle>
                <DialogDescription className="text-[12px] text-white/80">
                  {isEditing
                    ? "Cập nhật thông tin loại giai đoạn."
                    : "Xem thông tin chi tiết của loại giai đoạn."}
                </DialogDescription>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5 bg-neutral-50 px-6 py-6">
          {isLoading ? (
            <Section title="Đang tải">
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonRow key={i} />
                ))}
              </div>
            </Section>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Lỗi khi tải dữ liệu.
            </div>
          ) : detail ? (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className="grid grid-cols-1 gap-5 lg:grid-cols-2"
            >
              <Section title="Thông tin chung">
                <Row label="Mã loại">
                  <div className="flex items-center gap-2">
                    <div className="font-mono text-sm font-medium text-neutral-900">
                      #{detail.id}
                    </div>
                    <button
                      className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 px-2 py-1 text-[11px] text-neutral-700 transition-colors hover:bg-neutral-50"
                      onClick={() => handleCopy(String(detail.id), "mã loại")}
                      title="Sao chép mã"
                    >
                      <Copy className="h-3.5 w-3.5" /> Sao chép
                    </button>
                  </div>
                </Row>
                <div className="border-t" />
                <Row label="Tên loại giai đoạn">
                  {!isEditing ? (
                    <div
                      className="truncate text-sm font-medium text-neutral-900"
                      title={detail.name ?? ""}
                    >
                      {detail.name ?? "--"}
                    </div>
                  ) : (
                    <FieldInput
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nhập tên loại giai đoạn"
                      maxLength={200}
                    />
                  )}
                </Row>
                <div className="border-t" />
                <Row label="Mô tả" hint="Tối đa ~500 ký tự">
                  {!isEditing ? (
                    <div className="text-sm break-words whitespace-normal text-neutral-800">
                      {detail.description || "Không có"}
                    </div>
                  ) : (
                    <FieldTextarea
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Nhập mô tả"
                    />
                  )}
                </Row>
              </Section>

              <Section title="Thông tin hệ thống">
                <Row label="Ngày tạo">
                  <div
                    className="truncate text-sm"
                    title={
                      detail.createdAt ? formatDateTime(detail.createdAt) : ""
                    }
                  >
                    {detail.createdAt
                      ? formatDateTime(detail.createdAt)
                      : "Không có"}
                  </div>
                </Row>
                <div className="border-t" />
                <Row label="Ngày cập nhật">
                  <div
                    className="truncate text-sm"
                    title={
                      detail.updatedAt ? formatDateTime(detail.updatedAt) : ""
                    }
                  >
                    {detail.updatedAt
                      ? formatDateTime(detail.updatedAt)
                      : "Không có"}
                  </div>
                </Row>
                <div className="border-t" />
                <Row label="Người tạo">
                  <div
                    className="truncate text-sm"
                    title={detail.createdBy || ""}
                  >
                    {detail.createdBy || "Không có"}
                  </div>
                </Row>
                <div className="border-t" />
                <Row label="Người cập nhật">
                  <div
                    className="truncate text-sm"
                    title={detail.updatedBy || ""}
                  >
                    {detail.updatedBy || "Không có"}
                  </div>
                </Row>
              </Section>
            </motion.div>
          ) : (
            <div className="rounded-xl border border-dashed border-neutral-300 bg-white/50 px-6 py-10 text-center text-sm text-neutral-600">
              Không có dữ liệu loại giai đoạn.
            </div>
          )}
        </div>

        <DialogFooter className="sticky bottom-0 z-10 border-t bg-white/85 px-6 py-4 backdrop-blur">
          {!isEditing ? (
            <div className="flex w-full items-center justify-between">
              <div>
                <Button
                  variant="outline"
                  onClick={closeOrConfirm}
                  disabled={isSaving || isDeleting}
                  className="gap-2"
                >
                  <X className="h-4 w-4" /> Đóng
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setIsEditing(true)}
                  disabled={isSaving || isDeleting || !detail}
                  className="gap-2"
                >
                  <PencilLine className="h-4 w-4" /> Chỉnh sửa
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDelete}
                  disabled={isDeleting || isSaving || !detail}
                  className="gap-2 border-red-300 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  {isDeleting ? "Đang xóa..." : "Xóa"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  if (detail) {
                    setName(detail.name ?? "");
                    setDescription(detail.description ?? "");
                  }
                  setIsEditing(false);
                }}
                disabled={isSaving || isDeleting}
              >
                Huỷ
              </Button>
              <Button
                onClick={handleSave}
                disabled={!canSave || isSaving || isDeleting}
                className="gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" /> Lưu thay đổi
                  </>
                )}
              </Button>
            </div>
          )}
        </DialogFooter>

        {isSaving && (
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-white/50">
            <div className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-700 shadow-sm">
              <Loader2 className="h-4 w-4 animate-spin" /> Đang lưu...
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default PhaseTypeDetailDialog;
