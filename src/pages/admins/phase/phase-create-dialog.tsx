import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/globals/atoms/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/globals/atoms/dialog";
import { useCreatePhase } from "@/hooks/usePhase";
import { useAllPhaseTypes } from "@/hooks/usePhaseType";
import { useSemesters } from "@/hooks/useSemester";
import type { PhaseCreateDto } from "@/services/phaseService";
import { toast } from "sonner";

const todayYMD = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

interface PhaseCreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PhaseCreateDialog({
  isOpen,
  onClose,
}: PhaseCreateDialogProps) {
  const { mutate: createMutate, isPending: isCreating } = useCreatePhase();
  const { data: phaseTypes } = useAllPhaseTypes("");
  const { data: semesters } = useSemesters();

  const [form, setForm] = useState<PhaseCreateDto>({
    semesterId: 0,
    phaseTypeId: 0,
    name: "",
    startDate: todayYMD(),
    endDate: todayYMD(),
    submissionDeadline: todayYMD(),
  });

  useEffect(() => {
    if (isOpen) {
      setForm((prev) => ({
        ...prev,

        semesterId: semesters?.[0]?.id ?? 0,
        phaseTypeId: phaseTypes?.[0]?.id ?? 0,
      }));
    }
  }, [isOpen, semesters, phaseTypes]);

  const canCreate = useMemo(() => {
    return (
      !!form.name.trim() &&
      form.semesterId > 0 &&
      form.phaseTypeId > 0 &&
      !!form.startDate &&
      !!form.endDate &&
      !!form.submissionDeadline
    );
  }, [form]);

  const onChange = <K extends keyof PhaseCreateDto>(
    key: K,
    value: PhaseCreateDto[K],
  ) => setForm((f) => ({ ...f, [key]: value }));

  const handleCreate = () => {
    if (new Date(form.startDate) > new Date(form.endDate)) {
      toast.error("Ngày bắt đầu phải trước hoặc bằng ngày kết thúc");
      return;
    }
    if (new Date(form.submissionDeadline) > new Date(form.endDate)) {
      toast.error("Hạn nộp không được sau ngày kết thúc");
      return;
    }
    createMutate(form, {
      onSuccess: () => onClose(),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[720px] max-w-[92vw]">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-[18px]">Tạo giai đoạn mới</DialogTitle>
          <DialogDescription className="text-[12px]">
            Tạo phase thuộc một học kỳ với loại giai đoạn và mốc thời gian
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border bg-white">
          <div className="px-5">
            <div className="grid grid-cols-3 items-start gap-4 py-3">
              <div className="text-[11px] font-semibold tracking-wide text-neutral-500 uppercase">
                Tên giai đoạn
              </div>
              <div className="col-span-2">
                <input
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  placeholder="Nhập tên giai đoạn"
                  value={form.name}
                  onChange={(e) => onChange("name", e.target.value)}
                />
              </div>
            </div>
            <div className="border-t" />
            <div className="grid grid-cols-3 items-start gap-4 py-3">
              <div className="text-[11px] font-semibold tracking-wide text-neutral-500 uppercase">
                Loại giai đoạn
              </div>
              <div className="col-span-2">
                <select
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={form.phaseTypeId}
                  onChange={(e) =>
                    onChange("phaseTypeId", Number(e.target.value))
                  }
                >
                  {(phaseTypes ?? []).length === 0 && <option>—</option>}
                  {(phaseTypes ?? []).map((pt) => (
                    <option key={pt.id} value={pt.id}>
                      {pt.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="border-t" />

            <div className="grid grid-cols-3 items-start gap-4 py-3">
              <div className="text-[11px] font-semibold tracking-wide text-neutral-500 uppercase">
                Học kỳ
              </div>
              <div className="col-span-2">
                <select
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={form.semesterId}
                  onChange={(e) =>
                    onChange("semesterId", Number(e.target.value))
                  }
                >
                  {(semesters ?? []).length === 0 && <option>—</option>}
                  {(semesters ?? []).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="border-t" />

            <div className="grid grid-cols-3 items-start gap-4 py-3">
              <div className="text-[11px] font-semibold tracking-wide text-neutral-500 uppercase">
                Ngày bắt đầu
              </div>
              <div className="col-span-2">
                <input
                  type="date"
                  className="w-[220px] rounded-md border px-3 py-2 text-sm"
                  value={form.startDate}
                  onChange={(e) => onChange("startDate", e.target.value)}
                />
              </div>
            </div>
            <div className="border-t" />

            <div className="grid grid-cols-3 items-start gap-4 py-3">
              <div className="text-[11px] font-semibold tracking-wide text-neutral-500 uppercase">
                Ngày kết thúc
              </div>
              <div className="col-span-2">
                <input
                  type="date"
                  className="w-[220px] rounded-md border px-3 py-2 text-sm"
                  value={form.endDate}
                  onChange={(e) => onChange("endDate", e.target.value)}
                />
              </div>
            </div>
            <div className="border-t" />

            <div className="grid grid-cols-3 items-start gap-4 py-3">
              <div className="text-[11px] font-semibold tracking-wide text-neutral-500 uppercase">
                Hạn nộp
              </div>
              <div className="col-span-2">
                <input
                  type="date"
                  className="w-[220px] rounded-md border px-3 py-2 text-sm"
                  value={form.submissionDeadline}
                  onChange={(e) =>
                    onChange("submissionDeadline", e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isCreating}>
            Huỷ
          </Button>
          <Button onClick={handleCreate} disabled={!canCreate || isCreating}>
            {isCreating ? "Đang tạo..." : "Tạo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
