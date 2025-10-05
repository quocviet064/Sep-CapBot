import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/globals/atoms/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/globals/atoms/dialog";
import { formatDateTime } from "@/utils/formatter";
import {
  getSemesterDetail,
  type SemesterDetailDTO,
  type UpdateSemesterDTO,
} from "@/services/semesterService";
import {
  CalendarRange,
  Copy,
  Loader2,
  PencilLine,
  Save,
  Trash2,
  X,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import {
  useDeleteSemester,
  useUpdateSemester,
  useSemesters,
} from "@/hooks/useSemester";
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

function SkeletonRow() {
  return (
    <div className="grid grid-cols-12 items-center gap-4 py-3">
      <div className="col-span-4 sm:col-span-3">
        <div className="h-2.5 w-24 animate-pulse rounded bg-neutral-200" />
      </div>
      <div className="col-span-8 sm:col-span-9">
        <div className="h-10 w-full animate-pulse rounded-xl bg-neutral-200" />
      </div>
    </div>
  );
}

function TimelineBar({
  start,
  end,
}: {
  start?: string | null;
  end?: string | null;
}) {
  if (!start || !end) return null;
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (Number.isNaN(s) || Number.isNaN(e) || s >= e) return null;
  const pct = (v: number) => clamp(((v - s) / (e - s)) * 100, 0, 100);
  const nowPct = pct(Date.now());
  return (
    <div className="mt-2">
      <div className="relative h-2 w-full rounded-full bg-neutral-200">
        <div
          className="absolute top-0 left-0 h-2 rounded-full bg-gradient-to-r from-indigo-400 to-indigo-600"
          style={{ width: `${nowPct}%` }}
        />
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-neutral-500">
        <span>{toYMD(start)}</span>
        <span>{toYMD(end)}</span>
      </div>
    </div>
  );
}

interface SemesterDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  semesterId: string | null;
}

type TermType = "Summer" | "Fall" | "Spring";

const parseTermYear = (
  name?: string | null,
): { term: TermType; year: string } | null => {
  if (!name) return null;
  const m = name.match(/^(Summer|Fall|Spring)\s+(\d{4})$/i);
  if (!m) return null;
  const term = (m[1][0].toUpperCase() +
    m[1].slice(1).toLowerCase()) as TermType;
  return { term, year: m[2] };
};

export default function SemesterDetailDialog({
  isOpen,
  onClose,
  semesterId,
}: SemesterDetailDialogProps) {
  const [detail, setDetail] = useState<SemesterDetailDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<UpdateSemesterDTO | null>(null);

  const { mutate: updateMutate, isPending: isSaving } = useUpdateSemester();
  const { mutate: deleteMutate, isPending: isDeleting } = useDeleteSemester();

  const { data: semesters = [] } = useSemesters();

  const currentYear = String(new Date().getFullYear());
  const [term, setTerm] = useState<TermType>("Summer");
  const [year, setYear] = useState<string>(currentYear);

  useEffect(() => {
    if (!isOpen || !semesterId) return;
    setLoading(true);
    setErrorMsg(null);
    setDetail(null);
    setIsEditing(false);
    getSemesterDetail(Number(semesterId))
      .then((res) => {
        const d = res.data;
        if (!d.success) throw new Error(d.message || "Không thể tải dữ liệu");
        const s = d.data;
        setDetail(s);
        setForm({
          id: s.id,
          name: s.name,
          startDate: toYMD(s.startDate),
          endDate: toYMD(s.endDate),
          description: s.description,
        });
        const parsed = parseTermYear(s.name);
        if (parsed) {
          setTerm(parsed.term);
          setYear(parsed.year);
        } else {
          setTerm("Summer");
          setYear(currentYear);
        }
      })
      .catch((err: unknown) => {
        const msg =
          err instanceof Error ? err.message : "Không thể tải dữ liệu";
        setErrorMsg(msg);
      })
      .finally(() => setLoading(false));
  }, [isOpen, semesterId, currentYear]);

  const onChange = (key: keyof UpdateSemesterDTO, value: string | number) =>
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));

  useEffect(() => {
    if (!isEditing || !form) return;
    onChange("name", `${term} ${year}`.trim());
  }, [term, year, isEditing]);

  const isDuplicate = useMemo(() => {
    if (!form?.name) return false;
    const name = form.name.trim().toLowerCase();
    const id = String(form.id);
    return semesters.some(
      (s) =>
        String(s.id) !== id && (s.name || "").trim().toLowerCase() === name,
    );
  }, [form?.name, form?.id, semesters]);

  const canSave = useMemo(() => {
    if (!form) return false;
    return (
      !!form.name?.trim() &&
      !!form.startDate &&
      !!form.endDate &&
      !!form.description?.trim() &&
      !isDuplicate
    );
  }, [form, isDuplicate]);

  const isDirty = useMemo(() => {
    if (!form || !detail) return false;
    return (
      form.name !== detail.name ||
      form.description !== detail.description ||
      form.startDate !== toYMD(detail.startDate) ||
      form.endDate !== toYMD(detail.endDate)
    );
  }, [form, detail]);

  const handleSave = () => {
    if (!form) return;
    if (isDuplicate) {
      toast.error("Tên học kỳ đã tồn tại");
      return;
    }
    if (new Date(form.startDate) > new Date(form.endDate)) {
      toast.error("Ngày bắt đầu phải trước hoặc bằng ngày kết thúc");
      return;
    }
    updateMutate(form, {
      onSuccess: async () => {
        setLoading(true);
        try {
          const res = await getSemesterDetail(form.id);
          const payload = res.data;
          if (!payload.success)
            throw new Error(payload.message || "Không thể tải lại dữ liệu");
          setDetail(payload.data);
          setIsEditing(false);
          toast.success("Đã lưu thay đổi");
        } catch (e: unknown) {
          const msg =
            e instanceof Error ? e.message : "Không thể tải lại dữ liệu";
          setErrorMsg(msg);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleCopy = (text: string, label?: string) => {
    navigator.clipboard.writeText(text);
    toast.success(label ? `Đã sao chép ${label}` : "Đã sao chép");
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

  const handleDelete = () => {
    if (!detail) return;
    const ok = window.confirm(
      `Xóa học kỳ "${detail.name}"? Hành động này không thể hoàn tác.`,
    );
    if (!ok) return;
    deleteMutate(Number(detail.id), {
      onSuccess: () => {
        toast.success("Đã xóa học kỳ");
        onClose();
      },
      onError: (e: unknown) => {
        const msg = e instanceof Error ? e.message : "Xóa thất bại";
        toast.error(msg);
      },
    });
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

  const incYear = () => {
    const y = parseInt(year || currentYear, 10);
    const next = isNaN(y) ? parseInt(currentYear, 10) + 1 : y + 1;
    setYear(String(Math.min(9999, next)));
  };

  const decYear = () => {
    const y = parseInt(year || currentYear, 10);
    const next = isNaN(y) ? parseInt(currentYear, 10) - 1 : y - 1;
    setYear(String(Math.max(0, next)));
  };

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
                  {isEditing ? "Chỉnh sửa học kỳ" : "Chi tiết học kỳ"}
                </DialogTitle>
                <DialogDescription className="text-[12px] text-white/80">
                  {isEditing
                    ? "Cập nhật thông tin học kỳ."
                    : "Xem thông tin chi tiết của học kỳ."}
                </DialogDescription>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5 bg-neutral-50 px-6 py-6">
          {errorMsg && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMsg}
            </div>
          )}

          {loading ? (
            <Section title="Đang tải">
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonRow key={i} />
                ))}
              </div>
            </Section>
          ) : !detail ? (
            <div className="rounded-xl border border-dashed border-neutral-300 bg-white/50 px-6 py-10 text-center text-sm text-neutral-600">
              Chưa có dữ liệu. Hãy thử tải lại.
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className="grid grid-cols-1 gap-5 lg:grid-cols-2"
            >
              <Section title="Thông tin chung">
                <Row label="Mã học kỳ">
                  <div className="flex items-center gap-2">
                    <div className="font-mono text-sm font-medium text-neutral-900">
                      #{detail.id}
                    </div>
                    <button
                      className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 px-2 py-1 text-[11px] text-neutral-700 transition-colors hover:bg-neutral-50"
                      onClick={() => handleCopy(String(detail.id), "mã học kỳ")}
                      title="Sao chép mã"
                    >
                      <Copy className="h-3.5 w-3.5" /> Sao chép
                    </button>
                  </div>
                </Row>
                <div className="border-t" />
                <Row label="Tên học kỳ">
                  {!isEditing ? (
                    <div className="text-sm font-medium text-neutral-900">
                      {detail.name ?? "--"}
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-nowrap items-center gap-3 whitespace-nowrap">
                        <FieldSelect
                          value={term}
                          onChange={(e) => setTerm(e.target.value as TermType)}
                          className={[
                            "w-[160px]",
                            isDuplicate
                              ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-200/60"
                              : "",
                          ].join(" ")}
                        >
                          <option value="Summer">Summer</option>
                          <option value="Fall">Fall</option>
                          <option value="Spring">Spring</option>
                        </FieldSelect>
                        <div className="relative w-[140px]">
                          <FieldInput
                            inputMode="numeric"
                            value={year}
                            onChange={(e) => {
                              const v = e.target.value
                                .replace(/\D+/g, "")
                                .slice(0, 4);
                              setYear(v);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "ArrowUp") {
                                e.preventDefault();
                                incYear();
                              }
                              if (e.key === "ArrowDown") {
                                e.preventDefault();
                                decYear();
                              }
                            }}
                            placeholder="YYYY"
                            className={[
                              "pr-8 text-center",
                              isDuplicate
                                ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-200/60"
                                : "",
                            ].join(" ")}
                          />
                          <div className="pointer-events-auto absolute inset-y-0 right-1 flex w-6 flex-col items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={incYear}
                              className="inline-flex h-4 w-4 items-center justify-center rounded hover:bg-neutral-100 active:scale-95"
                              aria-label="Tăng năm"
                            >
                              <ChevronUp className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={decYear}
                              className="inline-flex h-4 w-4 items-center justify-center rounded hover:bg-neutral-100 active:scale-95"
                              aria-label="Giảm năm"
                            >
                              <ChevronDown className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                      {isDuplicate && (
                        <div className="mt-2 text-xs font-medium text-red-600">
                          Tên học kỳ{" "}
                          <span className="font-semibold">{form?.name}</span> đã
                          tồn tại. Vui lòng chọn kỳ khác hoặc đổi năm.
                        </div>
                      )}
                    </>
                  )}
                </Row>
                <div className="border-t" />
                <Row label="Xu hướng">
                  {!isEditing ? (
                    <div className="text-sm text-neutral-800">
                      {detail.description ?? "--"}
                    </div>
                  ) : (
                    <FieldTextarea
                      rows={4}
                      value={form?.description ?? ""}
                      onChange={(e) => onChange("description", e.target.value)}
                      placeholder="Nhập mô tả học kỳ"
                    />
                  )}
                </Row>
              </Section>

              <Section title="Thời gian">
                <Row label="Ngày bắt đầu">
                  {!isEditing ? (
                    <div className="text-sm font-medium text-neutral-900">
                      {detail ? formatDateTime(detail.startDate) : "--"}
                    </div>
                  ) : (
                    <FieldInput
                      type="date"
                      value={form?.startDate ?? ""}
                      onChange={(e) => onChange("startDate", e.target.value)}
                      max={form?.endDate || undefined}
                      className="w-[220px]"
                    />
                  )}
                </Row>
                <div className="border-t" />
                <Row label="Ngày kết thúc">
                  {!isEditing ? (
                    <div className="text-sm font-medium text-neutral-900">
                      {detail ? formatDateTime(detail.endDate) : "--"}
                    </div>
                  ) : (
                    <FieldInput
                      type="date"
                      value={form?.endDate ?? ""}
                      onChange={(e) => onChange("endDate", e.target.value)}
                      min={form?.startDate || undefined}
                      className="w-[220px]"
                    />
                  )}
                </Row>
                <TimelineBar start={detail.startDate} end={detail.endDate} />
              </Section>
            </motion.div>
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
                  <Trash2 className="h-4 w-4" /> Xóa
                </Button>
              </div>
            </div>
          ) : (
            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  if (detail) {
                    setForm({
                      id: detail.id,
                      name: detail.name,
                      startDate: toYMD(detail.startDate),
                      endDate: toYMD(detail.endDate),
                      description: detail.description,
                    });
                    const parsed = parseTermYear(detail.name);
                    if (parsed) {
                      setTerm(parsed.term);
                      setYear(parsed.year);
                    } else {
                      setTerm("Summer");
                      setYear(currentYear);
                    }
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
