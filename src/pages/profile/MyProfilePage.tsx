import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useMyProfile } from "@/hooks/useUserProfile";
import {
  useMyLecturerSkills,
  useCreateLecturerSkill,
  useBulkUpdateLecturerSkills,
} from "@/hooks/useLecturerSkills";
import { Card, CardContent } from "@/components/globals/atoms/card";
import { Button } from "@/components/globals/atoms/button";
import {
  ArrowLeft,
  BadgeCheck,
  Mail,
  UserRound,
  MapPin,
  Loader2,
  Tag,
  Plus,
  Pencil,
} from "lucide-react";
import { safeSrc } from "@/utils/safeSrc";
import { normalizeAssetUrl } from "@/utils/assetUrl";
import type {
  ProficiencyLevel,
  LecturerSkill,
  UpdateLecturerSkillPayload,
} from "@/services/lecturerSkillService";
import { deleteLecturerSkill } from "@/services/lecturerSkillService";
import AddSkillsDialog, { AddSkillItem } from "./AddSkillsDialog";
import EditSkillsDialog from "./EditSkillsDialog";
import { useQueryClient } from "@tanstack/react-query";

type WithResponseStatus = { response?: { status?: number } };
type MaybeStatus = { status?: number };

function getStatusFromError(err: unknown): number | undefined {
  if (!err || typeof err !== "object") return undefined;
  const e = err as WithResponseStatus & MaybeStatus;
  return e.response?.status ?? e.status;
}

function toNumber(val: unknown): number | undefined {
  if (typeof val === "number" && Number.isFinite(val)) return val;
  if (typeof val === "string") {
    const n = Number(val);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

function extractNumericId(u: unknown): number | undefined {
  const rec: Record<string, unknown> =
    (u as unknown as Record<string, unknown>) ?? {};
  const keys = ["nameid", "sub", "id", "userid"];
  for (const k of keys) {
    const v = rec[k];
    const n = toNumber(v);
    if (typeof n === "number") return n;
  }
  return undefined;
}

const viLevel = (v?: string) =>
  (
    ({
      Beginner: "Mới bắt đầu",
      Intermediate: "Trung cấp",
      Advanced: "Nâng cao",
      Expert: "Chuyên gia",
    }) as Record<string, string>
  )[String(v || "")] ||
  v ||
  "—";

export default function MyProfilePage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuth();
  const { data, isLoading, isError, error } = useMyProfile();
  const { data: mySkills, isLoading: skillsLoading } = useMyLecturerSkills(
    1,
    50,
  );
  const createSkill = useCreateLecturerSkill();
  const bulkUpdate = useBulkUpdateLecturerSkills();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [savingAdd, setSavingAdd] = useState(false);

  useEffect(() => {
    if (!isError) return;
    const status = getStatusFromError(error);
    if (status === 404)
      navigate("/profile/CreateProfilePage", { replace: true });
  }, [isError, error, navigate]);

  const urec: Record<string, unknown> =
    (user as unknown as Record<string, unknown>) ?? {};
  const email = typeof urec.email === "string" ? (urec.email as string) : "";
  const role = typeof urec.role === "string" ? (urec.role as string) : "—";
  const uniqueName =
    typeof urec["unique_name"] === "string"
      ? (urec["unique_name"] as string)
      : undefined;
  const nameFromAuth =
    uniqueName || (email.includes("@") ? email.split("@")[0] : "Người dùng");

  const cover =
    safeSrc(normalizeAssetUrl(data?.coverImage)) ||
    "https://images.unsplash.com/photo-1520975922329-0003f0327bb3?q=80&w=1600&auto=format&fit=crop";

  const avatar =
    safeSrc(normalizeAssetUrl(data?.avatar)) ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
      data?.fullName || nameFromAuth,
    )}`;

  const skills: LecturerSkill[] = mySkills?.listObjects ?? [];

  const lecturerIdFromProfile = toNumber(data?.userId);
  const lecturerIdFromSkills = toNumber(skills[0]?.lecturerId);
  const currentUserId = useMemo<number | undefined>(
    () => extractNumericId(user),
    [user],
  );
  const resolvedLecturerId =
    lecturerIdFromProfile ?? lecturerIdFromSkills ?? currentUserId;

  const handleSaveSkills = async (items: AddSkillItem[]) => {
    if (!resolvedLecturerId) return;
    setSavingAdd(true);
    try {
      await Promise.all(
        items.map((p) =>
          createSkill.mutateAsync({
            lecturerId: resolvedLecturerId,
            skillTag: p.skillTag,
            proficiencyLevel: p.proficiencyLevel as ProficiencyLevel,
          }),
        ),
      );
      setDialogOpen(false);
    } finally {
      setSavingAdd(false);
    }
  };

  const handleSaveEdit = async (payload: {
    updates: UpdateLecturerSkillPayload[];
    deletions: number[];
  }) => {
    const tasks: Array<Promise<unknown>> = [];
    if (payload.updates?.length) {
      tasks.push(bulkUpdate.mutateAsync(payload.updates));
    }
    if (payload.deletions?.length) {
      tasks.push(
        Promise.all(payload.deletions.map((id) => deleteLecturerSkill(id))),
      );
    }
    await Promise.allSettled(tasks);
    qc.invalidateQueries({ queryKey: ["my-lecturer-skills"] });
    qc.invalidateQueries({ queryKey: ["lecturer-skills"] });
    setEditOpen(false);
  };

  const existingSkillTags = skills.map((s) => s.skillTag);

  if (isLoading) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-neutral-950 text-neutral-100">
        <div className="pointer-events-none absolute top-[-180px] left-[-180px] h-[520px] w-[520px] rounded-full bg-gradient-to-br from-orange-500/30 via-amber-400/25 to-transparent blur-[120px]" />
        <div className="pointer-events-none absolute right-[-220px] bottom-[-220px] h-[620px] w-[620px] rounded-full bg-gradient-to-tr from-rose-400/25 via-orange-500/20 to-transparent blur-[140px]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,.06),transparent_40%),radial-gradient(ellipse_at_bottom,rgba(255,255,255,.05),transparent_40%)]" />
        <div className="relative mx-auto max-w-5xl px-6 py-10">
          <div className="mb-6 overflow-hidden rounded-3xl border border-neutral-800 bg-gradient-to-b from-[#0f141c]/95 via-[#0f141c]/85 to-[#0f141c]/75 shadow-[0_20px_80px_rgba(0,0,0,.5)]">
            <div className="h-[3px] w-full bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500" />
            <div className="flex items-center gap-4 px-6 py-4 sm:px-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-b from-amber-500 to-orange-600 shadow-[0_8px_22px_rgba(245,158,11,.35)]">
                <BadgeCheck className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="text-base leading-tight font-semibold text-neutral-100 sm:text-lg">
                  CapBot • Hồ sơ
                </div>
                <div className="text-xs tracking-wide text-neutral-400 sm:text-sm">
                  Đang tải dữ liệu…
                </div>
              </div>
            </div>
          </div>
          <Card className="relative overflow-hidden rounded-3xl border border-neutral-800 bg-gradient-to-b from-[#0f141c]/95 via-[#0f141c]/80 to-[#0f141c]/70 shadow-[0_20px_80px_rgba(0,0,0,.5)] backdrop-blur">
            <div className="absolute inset-0 z-20 grid place-items-center bg-black/60 backdrop-blur-sm">
              <div className="flex items-center gap-3 rounded-2xl border border-neutral-800 bg-neutral-900/80 px-6 py-5">
                <Loader2 className="h-6 w-6 animate-spin" />
                <div className="text-sm">Đang tải hồ sơ…</div>
              </div>
            </div>
            <div className="h-44 w-full overflow-hidden">
              <img src={cover} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f141c]/75 to-transparent" />
            </div>
            <CardContent className="p-6 sm:p-8" />
          </Card>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-neutral-950 text-neutral-100">
        <div className="pointer-events-none absolute top-[-180px] left-[-180px] h-[520px] w-[520px] rounded-full bg-gradient-to-br from-orange-500/30 via-amber-400/25 to-transparent blur-[120px]" />
        <div className="pointer-events-none absolute right-[-220px] bottom-[-220px] h-[620px] w-[620px] rounded-full bg-gradient-to-tr from-rose-400/25 via-orange-500/20 to-transparent blur-[140px]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,.06),transparent_40%),radial-gradient(ellipse_at_bottom,rgba(255,255,255,.05),transparent_40%)]" />
        <div className="relative mx-auto max-w-5xl px-6 py-10">
          <div className="mb-6 overflow-hidden rounded-3xl border border-neutral-800 bg-gradient-to-b from-[#0f141c]/95 via-[#0f141c]/85 to-[#0f141c]/75 shadow-[0_20px_80px_rgba(0,0,0,.5)]">
            <div className="h-[3px] w-full bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500" />
            <div className="flex items-center gap-4 px-6 py-4 sm:px-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-b from-amber-500 to-orange-600 shadow-[0_8px_22px_rgba(245,158,11,.35)]">
                <BadgeCheck className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="text-base leading-tight font-semibold text-neutral-100 sm:text-lg">
                  CapBot • Hồ sơ
                </div>
                <div className="text-xs tracking-wide text-neutral-400 sm:text-sm">
                  Lỗi tải hồ sơ. Vui lòng thử lại.
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900/70 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-neutral-950 text-neutral-100">
      <div className="pointer-events-none absolute top-[-180px] left-[-180px] h-[520px] w-[520px] rounded-full bg-gradient-to-br from-orange-500/30 via-amber-400/25 to-transparent blur-[120px]" />
      <div className="pointer-events-none absolute right-[-220px] bottom-[-220px] h-[620px] w-[620px] rounded-full bg-gradient-to-tr from-rose-400/25 via-orange-500/20 to-transparent blur-[140px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,.06),transparent_40%),radial-gradient(ellipse_at_bottom,rgba(255,255,255,.05),transparent_40%)]" />
      <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,rgba(255,255,255,.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.06)_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.06]" />
      <div className="relative mx-auto max-w-5xl px-6 py-10">
        <div className="mb-6 overflow-hidden rounded-3xl border border-neutral-800 bg-gradient-to-b from-[#0f141c]/95 via-[#0f141c]/85 to-[#0f141c]/75 shadow-[0_20px_80px_rgba(0,0,0,.5)]">
          <div className="h-[3px] w-full bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500" />
          <div className="flex items-center gap-4 px-6 py-4 sm:px-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-b from-amber-500 to-orange-600 shadow-[0_8px_22px_rgba(245,158,11,.35)]">
              <BadgeCheck className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="text-base leading-tight font-semibold text-neutral-100 sm:text-lg">
                CapBot • Hồ sơ
              </div>
              <div className="text-xs tracking-wide text-neutral-400 sm:text-sm">
                Xem và cập nhật thông tin cá nhân
              </div>
            </div>
          </div>
        </div>

        <Card className="relative overflow-hidden rounded-3xl border border-neutral-800 bg-gradient-to-b from-[#0f141c]/95 via-[#0f141c]/80 to-[#0f141c]/70 shadow-[0_20px_80px_rgba(0,0,0,.5)] backdrop-blur">
          <div className="h-44 w-full overflow-hidden">
            <div className="relative h-full w-full">
              <img src={cover} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f141c]/75 to-transparent" />
            </div>
          </div>

          <CardContent className="p-6 sm:p-8">
            <div className="-mt-16 mb-6 flex items-end gap-4">
              <div className="relative">
                <img
                  src={avatar}
                  alt=""
                  className="h-28 w-28 rounded-2xl border-4 border-[#0f141c] object-cover shadow-[0_10px_30px_rgba(0,0,0,.45)]"
                  onError={(e) => {
                    const img = e.currentTarget as HTMLImageElement;
                    img.onerror = null;
                    img.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                      data?.fullName || nameFromAuth,
                    )}`;
                  }}
                />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xl font-semibold text-neutral-100">
                  {data?.fullName || nameFromAuth}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                  <span className="inline-flex max-w-full items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900/70 px-3 py-1 text-neutral-200">
                    <Mail className="h-4 w-4 opacity-70" />
                    <span className="truncate">{email || "—"}</span>
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900/70 px-3 py-1 text-neutral-200">
                    <span className="opacity-70">Vai trò</span>
                    <span className="font-medium text-neutral-100">{role}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="order-1 rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4">
                <div className="mb-1 text-xs tracking-wider text-neutral-400 uppercase">
                  Họ và tên
                </div>
                <div className="text-neutral-100">{data?.fullName || "—"}</div>
              </div>

              <div className="order-2 rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4">
                <div className="mb-1 flex items-center gap-2 text-xs tracking-wider text-neutral-400 uppercase">
                  <MapPin className="h-3.5 w-3.5 opacity-70" />
                  Địa chỉ
                </div>
                <div className="text-neutral-100">{data?.address || "—"}</div>
              </div>

              <div className="order-3 rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4 sm:col-span-2">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs tracking-wider text-neutral-400 uppercase">
                    <Tag className="h-3.5 w-3.5 opacity-70" />
                    Kỹ năng
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={() => setEditOpen(true)}
                      className="h-8 border border-neutral-700 bg-neutral-900/70 text-neutral-100"
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Chỉnh sửa
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setDialogOpen(true)}
                      className="h-8 border border-amber-500/40 bg-gradient-to-tr from-amber-500 to-orange-600 text-white"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Thêm kỹ năng
                    </Button>
                  </div>
                </div>

                {skillsLoading ? (
                  <div className="inline-flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900/70 px-3 py-2 text-sm text-neutral-200">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Đang tải…</span>
                  </div>
                ) : skills.length ? (
                  <div className="max-h-[216px] overflow-y-auto pr-1">
                    <ul className="space-y-2">
                      {skills.map((s) => (
                        <li
                          key={s.id}
                          className="rounded-xl border border-neutral-800 bg-neutral-900/60 px-3 py-2"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="truncate text-sm font-medium text-neutral-100">
                              {s.skillTag}
                            </div>
                            <span className="shrink-0 rounded-lg border border-neutral-800 bg-neutral-900/80 px-2 py-1 text-xs text-neutral-200">
                              Trình độ: {viLevel(s.proficiencyLevel)}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3 text-sm text-neutral-300">
                    —
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                onClick={() => navigate("/profile/EditProfilePage")}
                className="w-full border border-amber-500/40 bg-gradient-to-tr from-amber-500 to-orange-600 text-white shadow-[0_10px_35px_rgba(245,158,11,.35)] transition hover:shadow-[0_14px_45px_rgba(245,158,11,.5)] focus-visible:ring-2 focus-visible:ring-amber-400/60 sm:w-auto"
              >
                <UserRound className="mr-2 h-4 w-4" />
                Cập nhật hồ sơ
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900/70 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </button>
        </div>
      </div>

      <AddSkillsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        saving={savingAdd || createSkill.isPending}
        onSave={handleSaveSkills}
        canSubmit={!!resolvedLecturerId}
        blockReason="Không xác định được lecturerId từ dữ liệu/tokens. Vui lòng tải lại trang hoặc đăng nhập lại."
        existingSkillTags={existingSkillTags}
      />

      <EditSkillsDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        saving={bulkUpdate.isPending}
        skills={skills}
        onSave={handleSaveEdit}
      />
    </div>
  );
}
