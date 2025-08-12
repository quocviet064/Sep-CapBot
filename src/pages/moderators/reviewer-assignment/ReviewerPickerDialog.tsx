// src/pages/moderators/reviewer-assignment/ReviewerPickerDialog.tsx
import { useEffect, useMemo, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/globals/atoms/dialog";
import { Button } from "@/components/globals/atoms/button";
import { Input } from "@/components/globals/atoms/input";
import { Checkbox } from "@/components/globals/atoms/checkbox";
import {
    useAvailableReviewers,
    useAutoAssignReviewers,
    useRecommendedReviewers,
} from "@/hooks/useReviewerAssignment";

type Reviewer = {
    id: number;
    userName: string;
    currentAssignments: number;
    matchScore?: number;
    reasons?: string[];
};

interface Props {
    isOpen: boolean;
    onClose: () => void;
    submissionId?: number; // Per-row: có; Bulk: có thể undefined
    onConfirm: (params: { reviewerIds: number[]; assignmentType: number }) => void;
}

export default function ReviewerPickerDialog({
    isOpen,
    onClose,
    submissionId,
    onConfirm,
}: Props) {
    // Tabs: default = "all" như yêu cầu
    const [tab, setTab] = useState<"recommended" | "all">("all");

    // Mỗi lần mở lại dialog → reset về "all"
    useEffect(() => {
        if (isOpen) setTab("all");
    }, [isOpen]);

    // Recommended query options
    const [recTop, setRecTop] = useState<number>(20);
    const [minSkill, setMinSkill] = useState<number>(50);
    const [excludeAssigned, setExcludeAssigned] = useState<boolean>(true);
    const [requireAvailability, setRequireAvailability] = useState<boolean>(true);
    const [includeOverloaded, setIncludeOverloaded] = useState<boolean>(false);

    const rec = useRecommendedReviewers(
        submissionId ? String(submissionId) : undefined,
        {
            top: recTop,
            minSkillMatch: minSkill,
            excludeAssigned,
            includeOverloaded,
            requireAvailability,
        },
    );

    const all = useAvailableReviewers(
        submissionId ? String(submissionId) : undefined,
    );

    // Manual select state
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<number[]>([]);
    const [assignmentType, setAssignmentType] = useState<number>(1);

    // Auto-assign state
    const [expandAuto, setExpandAuto] = useState<boolean>(false);
    const [maxWorkload, setMaxWorkload] = useState<number | undefined>(undefined);
    const [prioritizeHighPerformance, setPrioritizeHighPerformance] =
        useState<boolean>(true);
    const [skillTagsInput, setSkillTagsInput] = useState<string>("");

    const autoMut = useAutoAssignReviewers();

    useEffect(() => {
        if (!isOpen) {
            setSearch("");
            setSelected([]);
            setAssignmentType(1);
            setExpandAuto(false);
            setMaxWorkload(undefined);
            setPrioritizeHighPerformance(true);
            setSkillTagsInput("");
            setRecTop(20);
            setMinSkill(50);
            setExcludeAssigned(true);
            setRequireAvailability(true);
            setIncludeOverloaded(false);
        }
    }, [isOpen]);

    // Data theo tab
    const activeListRaw: Reviewer[] =
        tab === "recommended"
            ? ((rec.data ?? []) as Reviewer[])
            : ((all.data ?? []) as Reviewer[]);
    const isListLoading = tab === "recommended" ? rec.isLoading : all.isLoading;

    // Tìm kiếm
    const filtered = useMemo(() => {
        if (!search) return activeListRaw;
        const q = search.toLowerCase();
        return activeListRaw.filter(
            (x) => x.userName?.toLowerCase().includes(q) || String(x.id).includes(q),
        );
    }, [activeListRaw, search]);

    const toggle = (id: number, checked: boolean) => {
        setSelected((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));
    };

    const canConfirm = selected.length > 0 && !isListLoading;

    const doAutoAssign = () => {
        if (!submissionId) return;
        const tags = skillTagsInput
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);

        autoMut.mutate(
            {
                submissionId,
                maxWorkload,
                prioritizeHighPerformance,
                topicSkillTags: tags.length ? tags : undefined,
            },
            {
                onSuccess: () => onClose(),
            },
        );
    };

    const autoDisabled = !submissionId || autoMut.isPending;
    const recommendedDisabled = !submissionId;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            {/* Rộng hơn: 98vw và max 1400px */}
            <DialogContent className="w-[98vw] max-w-[1400px] max-h-[90vh] p-0 overflow-hidden">
                {/* Header */}
                <div className="sticky top-0 z-10 border-b bg-white px-6 py-4">
                    <DialogHeader>
                        <DialogTitle>Chọn reviewer</DialogTitle>
                        <DialogDescription>
                            {submissionId
                                ? `Tìm và tick reviewer để phân công cho Topic #${submissionId}, hoặc dùng Auto assign.`
                                : "Chế độ phân công nhiều đề tài: hãy chọn reviewer thủ công. (Recommended & Auto assign chỉ áp dụng khi mở theo 1 đề tài)"}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                {/* Body (scrollable) */}
                <div className="flex-1 space-y-4 overflow-auto px-6 pb-6 pt-4">
                    {/* Auto assign panel */}
                    <div className="rounded-md border p-4">
                        <div className="flex items-center justify-between">
                            <div className="font-medium">Tự động phân công</div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setExpandAuto((v) => !v)}
                                aria-expanded={expandAuto}
                            >
                                {expandAuto ? "Ẩn" : "Tùy chọn"}
                            </Button>
                        </div>

                        {expandAuto && (
                            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                                <div className="space-y-1">
                                    <label className="text-sm">Giới hạn workload</label>
                                    <Input
                                        type="number"
                                        placeholder="Ví dụ: 3"
                                        value={maxWorkload ?? ""}
                                        onChange={(e) =>
                                            setMaxWorkload(
                                                e.target.value ? Number(e.target.value) : undefined,
                                            )
                                        }
                                    />
                                </div>
                                <div className="flex items-center gap-2 pt-6">
                                    <Checkbox
                                        checked={prioritizeHighPerformance}
                                        onCheckedChange={(v) => setPrioritizeHighPerformance(!!v)}
                                        aria-label="Ưu tiên reviewer hiệu suất cao"
                                    />
                                    <span className="text-sm">Ưu tiên reviewer hiệu suất cao</span>
                                </div>
                                <div className="space-y-1 md:col-span-1">
                                    <label className="text-sm">Kỹ năng/Tags (phân cách bằng ,)</label>
                                    <Input
                                        placeholder="nodejs, react, ml"
                                        value={skillTagsInput}
                                        onChange={(e) => setSkillTagsInput(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="mt-3">
                            <Button
                                onClick={doAutoAssign}
                                disabled={autoDisabled}
                                title={!submissionId ? "Auto assign chỉ hỗ trợ 1 đề tài" : undefined}
                            >
                                {autoMut.isPending ? "Đang auto assign..." : "Auto assign"}
                            </Button>
                        </div>
                    </div>

                    {/* Tabs + controls */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Button
                                variant={tab === "all" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setTab("all")}
                                aria-pressed={tab === "all"}
                            >
                                Tất cả
                            </Button>
                            <Button
                                variant={tab === "recommended" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setTab("recommended")}
                                disabled={recommendedDisabled}
                                title={!submissionId ? "Cần mở theo 1 đề tài" : undefined}
                                aria-pressed={tab === "recommended"}
                            >
                                Recommended
                            </Button>
                        </div>

                        {/* Recommended filters */}
                        {tab === "recommended" && (
                            <div className="ml-0 grid grid-cols-1 items-center gap-3 md:ml-4 md:grid-cols-5">
                                <div className="flex items-center gap-2">
                                    <label className="text-sm">Top</label>
                                    <Input
                                        className="w-24"
                                        type="number"
                                        min={1}
                                        value={recTop}
                                        onChange={(e) =>
                                            setRecTop(Math.max(1, Number(e.target.value || 1)))
                                        }
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    <label className="text-sm">Min skill</label>
                                    <Input
                                        className="w-28"
                                        type="number"
                                        min={0}
                                        max={100}
                                        value={minSkill}
                                        onChange={(e) => {
                                            const v = Number(e.target.value || 0);
                                            setMinSkill(Math.max(0, Math.min(100, v)));
                                        }}
                                    />
                                </div>

                                <label className="flex cursor-pointer items-center gap-2">
                                    <Checkbox
                                        checked={excludeAssigned}
                                        onCheckedChange={(v) => setExcludeAssigned(!!v)}
                                        aria-label="Loại reviewer đã gán đề tài này"
                                    />
                                    <span className="text-sm">Exclude assigned</span>
                                </label>

                                <label className="flex cursor-pointer items-center gap-2">
                                    <Checkbox
                                        checked={requireAvailability}
                                        onCheckedChange={(v) => setRequireAvailability(!!v)}
                                        aria-label="Chỉ lấy reviewer available"
                                    />
                                    <span className="text-sm">Require availability</span>
                                </label>

                                <label className="flex cursor-pointer items-center gap-2">
                                    <Checkbox
                                        checked={includeOverloaded}
                                        onCheckedChange={(v) => setIncludeOverloaded(!!v)}
                                        aria-label="Bao gồm reviewer quá tải"
                                    />
                                    <span className="text-sm">Include overloaded</span>
                                </label>
                            </div>
                        )}

                        {/* Search + assignment type */}
                        <div className="ml-auto flex flex-wrap items-center gap-3">
                            <Input
                                placeholder="Tìm theo tên hoặc ID reviewer"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-[360px]"
                            />
                            <div className="flex items-center gap-2">
                                <label className="text-sm">Loại phân công</label>
                                <select
                                    className="rounded border px-2 py-1 text-sm"
                                    value={assignmentType}
                                    onChange={(e) => setAssignmentType(Number(e.target.value))}
                                >
                                    <option value={1}>Primary</option>
                                    <option value={2}>Secondary</option>
                                    <option value={3}>Additional</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* List */}
                    <div className="h-[60vh] overflow-auto rounded-md border">
                        {isListLoading ? (
                            <div className="p-4 text-sm text-gray-500">Đang tải reviewer...</div>
                        ) : filtered.length === 0 ? (
                            <div className="p-4 text-sm text-gray-500">
                                Không có reviewer phù hợp
                            </div>
                        ) : (
                            <table className="w-full text-sm">
                                <thead className="sticky top-0 z-10 bg-muted">
                                    <tr>
                                        <th className="w-10 p-2"></th>
                                        <th className="p-2 text-left">ID</th>
                                        <th className="p-2 text-left">Tên reviewer</th>
                                        <th className="p-2 text-left">Đang review</th>
                                        {tab === "recommended" && (
                                            <th className="p-2 text-left">Match</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((r) => {
                                        const checked = selected.includes(r.id);
                                        return (
                                            <tr key={r.id} className="border-t">
                                                <td className="p-2">
                                                    <Checkbox
                                                        checked={checked}
                                                        onCheckedChange={(v) => toggle(r.id, !!v)}
                                                        aria-label="Chọn reviewer"
                                                    />
                                                </td>
                                                <td className="p-2">{r.id}</td>
                                                <td className="p-2">
                                                    <div className="flex flex-col">
                                                        <span>{r.userName}</span>
                                                        {tab === "recommended" && r.reasons?.length ? (
                                                            <span className="text-xs text-gray-500">
                                                                {r.reasons.slice(0, 2).join(" • ")}
                                                                {r.reasons.length > 2 ? "…" : ""}
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                </td>
                                                <td className="p-2">{r.currentAssignments}</td>
                                                {tab === "recommended" && (
                                                    <td className="p-2">{r.matchScore ?? "-"}</td>
                                                )}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 z-10 border-t bg-white px-6 py-4">
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={onClose}>
                            Hủy
                        </Button>
                        <Button
                            onClick={() => onConfirm({ reviewerIds: selected, assignmentType })}
                            disabled={!canConfirm}
                        >
                            Xác nhận ({selected.length})
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
