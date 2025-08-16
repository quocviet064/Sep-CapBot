import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/globals/atoms/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/globals/atoms/dialog";
import { CalendarRange, Loader2, Save, X } from "lucide-react";
import { toast } from "sonner";
import { useAllPhaseTypes } from "@/hooks/usePhaseType";
import { useSemesters } from "@/hooks/useSemester";
import { useCreatePhase } from "@/hooks/usePhase";
import type { PhaseCreateDto } from "@/services/phaseService";
import { motion } from "framer-motion";

const toYMD = (isoOrYmd?: string | null) => {
  if (!isoOrYmd) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoOrYmd)) return isoOrYmd;
  const d = new Date(isoOrYmd);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const clamp = (n: number, a: number, b: number) => Math.min(Math.max(n, a), b);

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
    <div className="grid grid-cols-12 items-start gap-4 py-3">
      <div className="col-span-4 sm:col-span-3">
        <div className="text-[11px] font-semibold tracking-wide text-neutral-500 uppercase">
          {label}
        </div>
        {hint && <p className="mt-1 text-[11px] text-neutral-500">{hint}</p>}
      </div>
      <div className="col-span-8 sm:col-span-9">{children}</div>
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

function FieldSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
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

function TimelineBar({
  start,
  deadline,
  end,
}: {
  start?: string | null;
  deadline?: string | null;
  end?: string | null;
}) {
  if (!start || !end) return null;
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (Number.isNaN(s) || Number.isNaN(e) || s >= e) return null;
  const d = deadline ? new Date(deadline).getTime() : NaN;
  const pct = (v: number) => clamp(((v - s) / (e - s)) * 100, 0, 100);
  const nowPct = pct(Date.now());
  const deadlinePct = Number.isNaN(d) ? undefined : pct(d);

  return (
    <div className="mt-2">
      <div className="relative h-2 w-full rounded-full bg-neutral-200">
        <div
          className="absolute top-0 left-0 h-2 rounded-full bg-gradient-to-r from-indigo-400 to-indigo-600"
          style={{ width: `${nowPct}%` }}
        />
        {typeof deadlinePct === "number" && (
          <div
            className="absolute -top-1 h-4 w-0.5 -translate-x-1/2 rounded bg-amber-500"
            style={{ left: `${deadlinePct}%` }}
            title="Hạn nộp"
          />
        )}
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-neutral-500">
        <span>{toYMD(start)}</span>
        {deadline && <span>Hạn: {toYMD(deadline)}</span>}
        <span>{toYMD(end)}</span>
      </div>
    </div>
  );
}

type CreateForm = {
  semesterId?: number;
  phaseTypeId?: number;
  name: string;
  startDate: string;
  endDate: string;
  submissionDeadline: string;
};

export default function PhaseCreateDialog({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [form, setForm] = useState<CreateForm>({
    name: "",
    startDate: "",
    endDate: "",
    submissionDeadline: "",
  });

  const { data: phaseTypes } = useAllPhaseTypes("");
  const { data: semesters } = useSemesters();
  const { mutate: createMutate, isPending: isSaving } = useCreatePhase();

  const onChange = <K extends keyof CreateForm>(key: K, value: CreateForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const isDirty = useMemo(
    () =>
      !!form.name ||
      !!form.startDate ||
      !!form.endDate ||
      !!form.submissionDeadline ||
      typeof form.semesterId === "number" ||
      typeof form.phaseTypeId === "number",
    [form],
  );

  const canSave = useMemo(() => {
    return (
      !!form.name?.trim() &&
      !!form.startDate &&
      !!form.endDate &&
      !!form.submissionDeadline &&
      typeof form.semesterId === "number" &&
      typeof form.phaseTypeId === "number"
    );
  }, [form]);

  const resetForm = () =>
    setForm({
      name: "",
      startDate: "",
      endDate: "",
      submissionDeadline: "",
      semesterId: undefined,
      phaseTypeId: undefined,
    });

  const closeOrConfirm = () => {
    if (isDirty) {
      const ok = window.confirm("Bạn có thay đổi chưa lưu. Đóng hộp thoại?");
      if (!ok) return;
    }
    onClose();
  };

  const handleSave = () => {
    if (!canSave) return;
    if (new Date(form.startDate) > new Date(form.endDate)) {
      toast.error("Ngày bắt đầu phải trước hoặc bằng ngày kết thúc");
      return;
    }
    if (new Date(form.submissionDeadline) > new Date(form.endDate)) {
      toast.error("Hạn nộp không được sau ngày kết thúc");
      return;
    }
    if (new Date(form.submissionDeadline) < new Date(form.startDate)) {
      toast.error("Hạn nộp không được trước ngày bắt đầu");
      return;
    }

    const payload: PhaseCreateDto = {
      semesterId: form.semesterId as number,
      phaseTypeId: form.phaseTypeId as number,
      name: form.name.trim(),
      startDate: form.startDate,
      endDate: form.endDate,
      submissionDeadline: form.submissionDeadline,
    };

    createMutate(payload, {
      onSuccess: () => {
        toast.success("Tạo giai đoạn thành công");
        resetForm();
        onClose();
      },
      onError: (e: unknown) => {
        const msg = e instanceof Error ? e.message : "Tạo giai đoạn thất bại";
        toast.error(msg);
      },
    });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (!isSaving && canSave) handleSave();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isSaving, canSave]);

  return (
    <Dialog open={isOpen} onOpenChange={closeOrConfirm}>
      <DialogContent className="w-[980px] max-w-[96vw] overflow-hidden p-0">
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
                <CalendarRange className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-[18px] font-semibold">
                  Tạo giai đoạn mới
                </DialogTitle>
                <DialogDescription className="text-[12px] text-white/80">
                  Nhập thông tin giai đoạn (tên, loại, học kỳ, thời gian) rồi
                  lưu để tạo mới.
                </DialogDescription>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5 bg-neutral-50 px-6 py-6">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
            className="grid grid-cols-1 gap-5 lg:grid-cols-2"
          >
            <Section title="Thông tin chung">
              <Row label="Tên giai đoạn">
                <FieldInput
                  value={form.name}
                  onChange={(e) => onChange("name", e.target.value)}
                  placeholder="VD: Đề cương, Bảo vệ, ..."
                  maxLength={200}
                />
              </Row>
              <div className="border-t" />
              <Row label="Loại giai đoạn">
                <FieldSelect
                  value={form.phaseTypeId ?? ""}
                  onChange={(e) =>
                    onChange("phaseTypeId", Number(e.target.value))
                  }
                  disabled={!phaseTypes?.length}
                >
                  <option value="" disabled>
                    {phaseTypes?.length
                      ? "Chọn loại giai đoạn"
                      : "Đang tải ..."}
                  </option>
                  {(phaseTypes ?? []).map((pt) => (
                    <option key={pt.id} value={pt.id}>
                      {pt.name}
                    </option>
                  ))}
                </FieldSelect>
              </Row>
              <div className="border-t" />
              <Row label="Học kỳ">
                <FieldSelect
                  value={form.semesterId ?? ""}
                  onChange={(e) =>
                    onChange("semesterId", Number(e.target.value))
                  }
                  disabled={!semesters?.length}
                >
                  <option value="" disabled>
                    {semesters?.length ? "Chọn học kỳ" : "Đang tải ..."}
                  </option>
                  {(semesters ?? []).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </FieldSelect>
              </Row>
            </Section>

            <Section title="Thời gian">
              <Row label="Ngày bắt đầu">
                <FieldInput
                  type="date"
                  value={form.startDate}
                  onChange={(e) => onChange("startDate", e.target.value)}
                  max={form.endDate || undefined}
                  className="w-[220px]"
                />
              </Row>
              <div className="border-t" />
              <Row label="Ngày kết thúc">
                <FieldInput
                  type="date"
                  value={form.endDate}
                  onChange={(e) => onChange("endDate", e.target.value)}
                  min={form.startDate || undefined}
                  className="w-[220px]"
                />
              </Row>
              <div className="border-t" />
              <Row label="Hạn nộp">
                <FieldInput
                  type="date"
                  value={form.submissionDeadline}
                  onChange={(e) =>
                    onChange("submissionDeadline", e.target.value)
                  }
                  max={form.endDate || undefined}
                  min={form.startDate || undefined}
                  className="w-[220px]"
                />
              </Row>

              <TimelineBar
                start={form.startDate}
                deadline={form.submissionDeadline}
                end={form.endDate}
              />
            </Section>
          </motion.div>
        </div>

        <DialogFooter className="sticky bottom-0 z-10 border-t bg-white/85 px-6 py-4 backdrop-blur">
          <div className="flex w-full items-center justify-between">
            <div>
              <Button
                variant="outline"
                onClick={closeOrConfirm}
                disabled={isSaving}
                className="gap-2"
              >
                <X className="h-4 w-4" /> Đóng
              </Button>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="outline"
                onClick={resetForm}
                disabled={isSaving || !isDirty}
              >
                Làm mới
              </Button>
              <Button
                onClick={handleSave}
                disabled={!canSave || isSaving}
                className="gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Đang tạo...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" /> Tạo giai đoạn
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>

        {isSaving && (
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-white/50">
            <div className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-700 shadow-sm">
              <Loader2 className="h-4 w-4 animate-spin" /> Đang tạo...
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
