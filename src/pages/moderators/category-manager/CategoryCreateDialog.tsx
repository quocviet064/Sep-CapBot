import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/globals/atoms/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/globals/atoms/dialog";
import { ClipboardPlus, Loader2, Save, X } from "lucide-react";
import { Input } from "@/components/globals/atoms/input";
import { Textarea } from "@/components/globals/atoms/textarea";
import { useCreateCategory } from "@/hooks/useCategory";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CategoryCreateDialog({
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const { mutateAsync: createCategory, isPending } = useCreateCategory();

  useEffect(() => {
    if (!isOpen) {
      setName("");
      setDescription("");
    }
  }, [isOpen]);

  const canSave = useMemo(() => {
    return !!name.trim();
  }, [name]);

  const handleCreate = async () => {
    if (!canSave) {
      toast.error("Vui lòng nhập tên danh mục.");
      return;
    }
    const id = toast.loading("Đang tạo danh mục...");
    try {
      await createCategory({
        name: name.trim(),
        description: description.trim(),
      });
      toast.success("Tạo danh mục thành công", { id });
      onSuccess?.();
      onClose();
    } catch {
      toast.error("Tạo danh mục thất bại", { id });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[720px] max-w-[96vw] overflow-hidden p-0">
        <div className="relative">
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-indigo-600 to-violet-600" />
          <div
            className="absolute inset-0 -z-10 opacity-60"
            style={{
              backgroundImage:
                "radial-gradient(900px 300px at -10% -40%, rgba(255,255,255,.35), transparent 60%), radial-gradient(700px 260px at 110% -30%, rgba(255,255,255,.25), transparent 60%)",
            }}
          />
          <div className="flex items-center justify-between px-6 py-5 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20 backdrop-blur">
                <ClipboardPlus className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-[18px] font-semibold">
                  Tạo danh mục đề tài
                </DialogTitle>
                <DialogDescription className="text-[12px] text-white/80">
                  Nhập thông tin danh mục và lưu lại.
                </DialogDescription>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5 bg-neutral-50 px-6 py-6">
          <div className="rounded-2xl border border-neutral-200/70 bg-white/80 px-5 py-4 shadow-sm ring-1 ring-black/5 backdrop-blur">
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="text-[11px] font-semibold tracking-wide text-neutral-500 uppercase">
                  Tên danh mục
                </div>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="VD: Web, AI, IoT"
                />
              </div>
              <div className="border-t" />
              <div className="space-y-1">
                <div className="text-[11px] font-semibold tracking-wide text-neutral-500 uppercase">
                  Mô tả
                </div>
                <Textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ghi chú / mô tả"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="sticky bottom-0 z-10 border-t bg-white/85 px-6 py-4 backdrop-blur">
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isPending}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Đóng
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!canSave || isPending}
              className="gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Tạo danh mục
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
