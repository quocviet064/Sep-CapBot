import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/globals/atoms/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/globals/atoms/dialog";
import {
  Tags,
  Loader2,
  Save,
  X,
  PlusCircle,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import type { ProficiencyLevel } from "@/services/lecturerSkillService";

import { LECTURER_SKILL_TAGS } from "./lecturerSkillTags";

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

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
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

const LEVELS: { value: ProficiencyLevel; label: string }[] = [
  { value: "Beginner", label: "Mới bắt đầu" },
  { value: "Intermediate", label: "Trung cấp" },
  { value: "Advanced", label: "Nâng cao" },
  { value: "Expert", label: "Chuyên gia" },
];

const rid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

export type AddSkillItem = {
  skillTag: string;
  proficiencyLevel: ProficiencyLevel;
};

type RowItem = { id: string; skillTag: string; level: ProficiencyLevel };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  saving?: boolean;
  onSave: (items: AddSkillItem[]) => Promise<void> | void;

  canSubmit?: boolean;

  blockReason?: string;

  existingSkillTags?: string[];
};

export default function AddSkillsDialog({
  open,
  onOpenChange,
  saving,
  onSave,
  canSubmit = true,
  blockReason,
  existingSkillTags = [],
}: Props) {
  const [rows, setRows] = useState<RowItem[]>([
    { id: rid(), skillTag: "", level: "Beginner" },
  ]);

  useEffect(() => {
    if (open) setRows([{ id: rid(), skillTag: "", level: "Beginner" }]);
  }, [open]);

  const existingSet = useMemo(
    () =>
      new Set(
        (existingSkillTags || [])
          .map((t) => (t || "").trim())
          .filter((t) => t.length),
      ),
    [existingSkillTags],
  );

  const nonEmpty = useMemo(
    () => rows.map((r) => r.skillTag.trim()).filter((v) => v.length > 0),
    [rows],
  );

  const dupWithin: string[] = useMemo(() => {
    const count = new Map<string, number>();
    nonEmpty.forEach((t) => count.set(t, (count.get(t) || 0) + 1));
    return [...count.entries()].filter(([, c]) => c > 1).map(([t]) => t);
  }, [nonEmpty]);

  const dupWithExisting: string[] = useMemo(() => {
    const seen = new Set<string>();
    nonEmpty.forEach((t) => {
      if (existingSet.has(t)) seen.add(t);
    });
    return [...seen];
  }, [nonEmpty, existingSet]);

  const hasAnySkill = nonEmpty.length > 0;

  const allowSave =
    !!canSubmit &&
    hasAnySkill &&
    !saving &&
    dupWithin.length === 0 &&
    dupWithExisting.length === 0;

  const addRow = () =>
    setRows((prev) => [
      ...prev,
      { id: rid(), skillTag: "", level: "Beginner" },
    ]);

  const removeRow = (id: string) =>
    setRows((prev) =>
      prev.length > 1 ? prev.filter((r) => r.id !== id) : prev,
    );

  const handleSave = async () => {
    if (!allowSave) return;
    const items: AddSkillItem[] = rows
      .map((r) => ({
        skillTag: r.skillTag.trim(),
        proficiencyLevel: r.level,
      }))
      .filter((x) => !!x.skillTag);
    await onSave(items);
  };

  const isRowDupWithin = (tag: string) =>
    tag.trim().length > 0 && dupWithin.includes(tag.trim());
  const isRowDupExisting = (tag: string) =>
    tag.trim().length > 0 && existingSet.has(tag.trim());

  return (
    <Dialog open={open} onOpenChange={(o) => !saving && onOpenChange(o)}>
      <DialogContent className="w-[900px] max-w-[98vw] overflow-hidden p-0 md:w-[980px] lg:w-[1100px]">
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
                <Tags className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-[18px] font-semibold">
                  Thêm kỹ năng
                </DialogTitle>
                <DialogDescription className="text-[12px] text-white/80">
                  Chọn nhiều kỹ năng và mức độ cho mỗi mục, sau đó lưu lại.
                </DialogDescription>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5 bg-neutral-50 px-6 py-6">
          {!canSubmit && (
            <div className="rounded-2xl border border-amber-300/70 bg-amber-50 px-4 py-3 text-amber-800">
              <div className="flex items-center gap-2 text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span>
                  {blockReason || "Không thể lưu do thiếu thông tin."}
                </span>
              </div>
            </div>
          )}

          {(dupWithin.length > 0 || dupWithExisting.length > 0) && (
            <div className="rounded-2xl border border-rose-300/70 bg-rose-50 px-4 py-3 text-rose-800">
              <div className="flex items-start gap-3 text-sm">
                <AlertTriangle className="mt-0.5 h-4 w-4" />
                <div className="space-y-1">
                  {dupWithin.length > 0 && (
                    <div>
                      Bạn đã chọn <b>trùng kỹ năng</b> trong danh sách:&nbsp;
                      <span className="font-medium">
                        {dupWithin.join(", ")}
                      </span>
                      .
                    </div>
                  )}
                  {dupWithExisting.length > 0 && (
                    <div>
                      Các kỹ năng sau <b>đã tồn tại</b> trong hồ sơ:&nbsp;
                      <span className="font-medium">
                        {dupWithExisting.join(", ")}
                      </span>
                      .
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-neutral-200/70 bg-white/80 px-5 py-4 shadow-sm ring-1 ring-black/5 backdrop-blur">
            <Row label="Danh sách kỹ năng">
              <div className="space-y-3">
                {rows.map((r, idx) => {
                  const tag = r.skillTag;
                  const dup1 = isRowDupWithin(tag);
                  const dup2 = isRowDupExisting(tag);
                  const borderClass =
                    dup1 || dup2 ? "border-rose-300" : "border-neutral-200";

                  return (
                    <div
                      key={r.id}
                      className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(360px,1fr)_260px_48px]"
                    >
                      <FieldSelect
                        value={r.skillTag}
                        onChange={(e) =>
                          setRows((prev) =>
                            prev.map((x) =>
                              x.id === r.id
                                ? { ...x, skillTag: e.target.value }
                                : x,
                            ),
                          )
                        }
                        disabled={!!saving}
                        className={borderClass}
                      >
                        <option value="" disabled>
                          {`Chọn kỹ năng ${
                            rows.length > 1 ? `(#${idx + 1})` : ""
                          }`}
                        </option>
                        {LECTURER_SKILL_TAGS.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </FieldSelect>

                      <FieldSelect
                        value={r.level}
                        onChange={(e) =>
                          setRows((prev) =>
                            prev.map((x) =>
                              x.id === r.id
                                ? {
                                    ...x,
                                    level: e.target.value as ProficiencyLevel,
                                  }
                                : x,
                            ),
                          )
                        }
                        disabled={!!saving}
                      >
                        {LEVELS.map((lv) => (
                          <option key={lv.value} value={lv.value}>
                            {lv.label}
                          </option>
                        ))}
                      </FieldSelect>

                      <button
                        type="button"
                        onClick={() => removeRow(r.id)}
                        className="inline-flex h-[42px] items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-600 shadow-sm hover:bg-neutral-50 active:scale-95 disabled:opacity-50"
                        disabled={rows.length === 1 || !!saving}
                        title="Xóa dòng"
                        aria-label="Xóa dòng"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                      {(dup1 || dup2) && (
                        <div className="-mt-1 text-[12px] text-rose-600 sm:col-span-2">
                          {dup1 && "Kỹ năng này đang bị trùng với dòng khác."}
                          {dup1 && dup2 && " "}
                          {dup2 && "Kỹ năng này đã tồn tại trong hồ sơ."}
                        </div>
                      )}
                    </div>
                  );
                })}

                <div>
                  <Button
                    type="button"
                    onClick={addRow}
                    disabled={!!saving}
                    className="gap-2"
                    variant="outline"
                  >
                    <PlusCircle className="h-4 w-4" /> Thêm dòng
                  </Button>
                </div>
              </div>
            </Row>
          </div>
        </div>

        <div className="sticky bottom-0 z-10 flex items-center justify-end gap-2 border-t bg-white/85 px-6 py-4 backdrop-blur">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={!!saving}
            className="gap-2"
          >
            <X className="h-4 w-4" /> Đóng
          </Button>
          <Button onClick={handleSave} disabled={!allowSave} className="gap-2">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Đang lưu...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> Lưu
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
