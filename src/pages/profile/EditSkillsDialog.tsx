import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/globals/atoms/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/globals/atoms/dialog";
import { Edit3, Loader2, Save, X, Trash2, RotateCcw } from "lucide-react";
import type {
  LecturerSkill,
  ProficiencyLevel,
  UpdateLecturerSkillPayload,
} from "@/services/lecturerSkillService";

function FieldSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={[
        "h-9 rounded-xl border px-3 text-sm",
        "border-neutral-200 bg-white shadow-inner outline-none",
        "focus:border-indigo-400 focus:ring-4 focus:ring-indigo-200/60",
        props.className || "",
      ].join(" ")}
    />
  );
}

const LEVELS: { value: ProficiencyLevel; label: string }[] = [
  { value: "Beginner", label: "Mới bắt đầu" },
  { value: "Intermediate", label: "Trung cấp" },
  { value: "Advanced", label: "Nâng cao" },
  { value: "Expert", label: "Chuyên gia" },
];

type Row = {
  id: number;
  skillTag: string;
  level: ProficiencyLevel;
  origLevel: ProficiencyLevel;
  selected: boolean;
  toDelete: boolean;
};

type SavePayload = {
  updates: UpdateLecturerSkillPayload[];
  deletions: number[];
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  saving?: boolean;
  skills: LecturerSkill[];
  onSave: (payload: SavePayload) => Promise<void> | void;
};

export default function EditSkillsDialog({
  open,
  onOpenChange,
  saving,
  skills,
  onSave,
}: Props) {
  const initialRows: Row[] = useMemo(
    () =>
      (skills || []).map((s) => ({
        id: s.id,
        skillTag: s.skillTag,
        level: s.proficiencyLevel as ProficiencyLevel,
        origLevel: s.proficiencyLevel as ProficiencyLevel,
        selected: false,
        toDelete: false,
      })),
    [skills],
  );

  const [rows, setRows] = useState<Row[]>(initialRows);

  useEffect(() => {
    if (open) setRows(initialRows);
  }, [open, initialRows]);

  const updates: UpdateLecturerSkillPayload[] = useMemo(() => {
    return rows
      .filter((r) => !r.toDelete && r.level !== r.origLevel)
      .map((r) => ({
        id: r.id,
        skillTag: r.skillTag,
        proficiencyLevel: r.level,
      }));
  }, [rows]);

  const deletions: number[] = useMemo(
    () => rows.filter((r) => r.toDelete).map((r) => r.id),
    [rows],
  );

  const hasChanges = updates.length > 0 || deletions.length > 0;
  const allowSave = hasChanges && !saving;

  const anySelected = rows.some((r) => r.selected);
  const canTempDelete = rows.some((r) => r.selected && !r.toDelete);

  const toggleSelect = (id: number, checked: boolean) =>
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, selected: checked } : r)),
    );

  const selectAll = (checked: boolean) =>
    setRows((prev) => prev.map((r) => ({ ...r, selected: checked })));

  const tempDeleteSelected = () =>
    setRows((prev) =>
      prev.map((r) => (r.selected ? { ...r, toDelete: true } : r)),
    );

  const restoreAll = () => {
    setRows(initialRows);
  };

  const handleSave = async () => {
    if (!allowSave) return;
    await onSave({ updates, deletions });
  };

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
                <Edit3 className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-[18px] font-semibold">
                  Chỉnh sửa kỹ năng
                </DialogTitle>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5 bg-neutral-50 px-6 py-6">
          <div className="rounded-2xl border border-neutral-200/70 bg-white/80 px-5 py-4 shadow-sm ring-1 ring-black/5 backdrop-blur">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-[11px] font-semibold tracking-wide text-neutral-500 uppercase">
                Danh sách kỹ năng
              </div>
              <div className="flex items-center gap-2">
                <label className="inline-flex items-center gap-2 text-sm text-neutral-700 select-none">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-400"
                    checked={rows.length > 0 && rows.every((r) => r.selected)}
                    onChange={(e) => selectAll(e.target.checked)}
                  />
                  Chọn tất cả
                </label>
              </div>
            </div>

            <div className="max-h-[380px] overflow-y-auto pr-1">
              <ul className="space-y-2">
                {rows
                  .filter((r) => !r.toDelete)
                  .map((r) => (
                    <li
                      key={r.id}
                      className={[
                        "rounded-xl border bg-white px-4 py-3 shadow-inner",
                        r.toDelete
                          ? "border-rose-300/70 bg-rose-50"
                          : "border-neutral-200",
                      ].join(" ")}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <label className="flex min-w-0 flex-1 items-center gap-3">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-400"
                            checked={r.selected}
                            onChange={(e) =>
                              toggleSelect(r.id, e.target.checked)
                            }
                            disabled={!!saving}
                          />
                          <span
                            className={[
                              "truncate text-sm font-medium",
                              r.toDelete
                                ? "text-rose-700 line-through"
                                : "text-neutral-900",
                            ].join(" ")}
                            title={r.skillTag}
                          >
                            {r.skillTag}
                          </span>
                        </label>

                        <div className="flex items-center gap-2">
                          {r.toDelete && (
                            <span className="rounded-lg border border-rose-300 bg-rose-100 px-2 py-1 text-[11px] font-medium text-rose-700">
                              Sẽ xóa
                            </span>
                          )}
                          <FieldSelect
                            value={r.level}
                            onChange={(e) =>
                              setRows((prev) =>
                                prev.map((x) =>
                                  x.id === r.id
                                    ? {
                                        ...x,
                                        level: e.target
                                          .value as ProficiencyLevel,
                                      }
                                    : x,
                                ),
                              )
                            }
                            disabled={!!saving || r.toDelete}
                            aria-label="Chọn mức độ"
                          >
                            {LEVELS.map((lv) => (
                              <option key={lv.value} value={lv.value}>
                                {lv.label}
                              </option>
                            ))}
                          </FieldSelect>
                        </div>
                      </div>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 z-10 flex flex-wrap items-center justify-end gap-2 border-t bg-white/85 px-6 py-4 backdrop-blur">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={!!saving}
            className="gap-2"
          >
            <X className="h-4 w-4" /> Đóng
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={restoreAll}
            disabled={!hasChanges || !!saving}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Khôi phục
          </Button>

          <Button
            type="button"
            variant="destructive"
            onClick={tempDeleteSelected}
            disabled={!anySelected || !canTempDelete || !!saving}
            className="gap-2 border border-rose-400 bg-rose-600 text-white hover:bg-rose-700"
          >
            <Trash2 className="h-4 w-4" />
            Xóa
          </Button>

          <Button onClick={handleSave} disabled={!allowSave} className="gap-2">
            {saving ? (
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
      </DialogContent>
    </Dialog>
  );
}
