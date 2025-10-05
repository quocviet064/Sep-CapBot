import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/globals/atoms/card";
import { Button } from "@/components/globals/atoms/button";
import {
  ArrowLeft,
  BadgeCheck,
  Loader2,
  MapPin,
  Tag,
  Shield,
  X,
  PlusCircle,
} from "lucide-react";
import { normalizeAssetUrl } from "@/utils/assetUrl";
import { safeSrc } from "@/utils/safeSrc";
import { useUserProfileByUserId } from "@/hooks/useUserProfile";
import { useLecturerSkills } from "@/hooks/useLecturerSkills";
import type { LecturerSkill } from "@/services/lecturerSkillService";
import {
  useUserRoles,
  useAddUserRoles,
  useDeleteUserRoles,
} from "@/hooks/useUserRoles";
import { toast } from "sonner";

function toNumber(val: unknown): number | undefined {
  if (typeof val === "number" && Number.isFinite(val)) return val;
  if (typeof val === "string") {
    const n = Number(val);
    if (Number.isFinite(n)) return n;
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

const ALL_ROLES = [
  "Moderator",
  "Reviewer",
  "Supervisor",
  "Administrator",
] as const;
type RoleName = (typeof ALL_ROLES)[number];

export default function AdminUserDetailPage() {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const uidNum = toNumber(userId);
  const validUid: number | undefined = useMemo(
    () => (typeof uidNum === "number" ? uidNum : undefined),
    [uidNum],
  );

  const {
    data: profile,
    isLoading: profileLoading,
    isError: profileError,
    error: profileErrObj,
  } = useUserProfileByUserId(validUid);

  const {
    data: skillsRes,
    isLoading: skillsLoading,
    isError: skillsError,
  } = useLecturerSkills(validUid, 1, 50);

  const {
    data: roles,
    isLoading: rolesLoading,
    isError: rolesError,
  } = useUserRoles(validUid);
  const addRoles = useAddUserRoles();
  const deleteRoles = useDeleteUserRoles();

  const [selectedRole, setSelectedRole] = useState<RoleName | "">("");

  const fullName = profile?.fullName || "—";
  const address = profile?.address || "—";
  const cover =
    safeSrc(normalizeAssetUrl(profile?.coverImage)) ||
    "https://images.unsplash.com/photo-1520975922329-0003f0327bb3?q=80&w=1600&auto=format&fit=crop";
  const avatar =
    safeSrc(normalizeAssetUrl(profile?.avatar)) ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
      fullName || `User ${validUid ?? ""}`,
    )}`;

  const skills: LecturerSkill[] = skillsRes?.listObjects ?? [];
  const roleNames: string[] = (roles ?? []).map((r) => r.roleName);

  const availableOptions = useMemo(
    () =>
      ALL_ROLES.map((r) => ({
        value: r,
        label: r,
        disabled: roleNames.includes(r),
      })),
    [roleNames],
  );

  const canAdd =
    !!validUid &&
    selectedRole !== "" &&
    !roleNames.includes(selectedRole) &&
    !addRoles.isPending;

  const handleAddRole = () => {
    if (!validUid || selectedRole === "") return;
    if (roleNames.includes(selectedRole)) {
      toast.warning("Quyền này đã tồn tại, không thể thêm trùng.");
      return;
    }
    addRoles.mutate(
      { userId: validUid, roles: [selectedRole] },
      {
        onSuccess: () => {
          setSelectedRole("");
        },
      },
    );
  };

  const renderHeader = (subtitle: string) => (
    <div className="mb-6 overflow-hidden rounded-3xl border border-neutral-800 bg-gradient-to-b from-[#0f141c]/95 via-[#0f141c]/85 to-[#0f141c]/75 shadow-[0_20px_80px_rgba(0,0,0,.5)]">
      <div className="h-[3px] w-full bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500" />
      <div className="flex items-center gap-4 px-6 py-4 sm:px-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-b from-amber-500 to-orange-600 shadow-[0_8px_22px_rgba(245,158,11,.35)]">
          <BadgeCheck className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0">
          <div className="text-base leading-tight font-semibold text-neutral-100 sm:text-lg">
            CapBot • Hồ sơ người dùng
          </div>
          <div className="text-xs tracking-wide text-neutral-400 sm:text-sm">
            {subtitle}
          </div>
        </div>
      </div>
    </div>
  );

  if (!validUid) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-neutral-950 text-neutral-100">
        <div className="pointer-events-none absolute top-[-180px] left-[-180px] h-[520px] w-[520px] rounded-full bg-gradient-to-br from-orange-500/30 via-amber-400/25 to-transparent blur-[120px]" />
        <div className="pointer-events-none absolute right-[-220px] bottom-[-220px] h-[620px] w-[620px] rounded-full bg-gradient-to-tr from-rose-400/25 via-orange-500/20 to-transparent blur-[140px]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,.06),transparent_40%),radial-gradient(ellipse_at_bottom,rgba(255,255,255,.05),transparent_40%)]" />
        <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,rgba(255,255,255,.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.06)_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.06]" />

        <div className="relative mx-auto max-w-5xl px-6 py-10">
          {renderHeader("Tham số không hợp lệ")}
          <Card className="overflow-hidden rounded-3xl border border-neutral-800 bg-gradient-to-b from-[#0f141c]/95 via-[#0f141c]/80 to-[#0f141c]/70">
            <CardContent className="p-8">
              <div className="mb-4 text-lg font-semibold text-neutral-100">
                Không xác định được userId hợp lệ.
              </div>
              <Button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 border border-neutral-800 bg-neutral-900/70 text-neutral-200 hover:bg-neutral-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Quay lại
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-neutral-950 text-neutral-100">
        <div className="pointer-events-none absolute top-[-180px] left-[-180px] h-[520px] w-[520px] rounded-full bg-gradient-to-br from-orange-500/30 via-amber-400/25 to-transparent blur-[120px]" />
        <div className="pointer-events-none absolute right-[-220px] bottom-[-220px] h-[620px] w-[620px] rounded-full bg-gradient-to-tr from-rose-400/25 via-orange-500/20 to-transparent blur-[140px]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,.06),transparent_40%),radial-gradient(ellipse_at_bottom,rgba(255,255,255,.05),transparent_40%)]" />
        <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,rgba(255,255,255,.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.06)_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.06]" />

        <div className="relative mx-auto max-w-5xl px-6 py-10">
          {renderHeader("Đang tải dữ liệu…")}
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

  if (profileError) {
    const msg =
      (profileErrObj && (profileErrObj as Error).message) ||
      "Lỗi tải hồ sơ. Vui lòng thử lại.";
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-neutral-950 text-neutral-100">
        <div className="pointer-events-none absolute top-[-180px] left-[-180px] h-[520px] w-[520px] rounded-full bg-gradient-to-br from-orange-500/30 via-amber-400/25 to-transparent blur-[120px]" />
        <div className="pointer-events-none absolute right-[-220px] bottom-[-220px] h-[620px] w-[620px] rounded-full bg-gradient-to-tr from-rose-400/25 via-orange-500/20 to-transparent blur-[140px]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,.06),transparent_40%),radial-gradient(ellipse_at_bottom,rgba(255,255,255,.05),transparent_40%)]" />
        <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,rgba(255,255,255,.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.06)_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.06]" />

        <div className="relative mx-auto max-w-5xl px-6 py-10">
          {renderHeader("Không thể tải hồ sơ")}
          <Card className="overflow-hidden rounded-3xl border border-neutral-800 bg-gradient-to-b from-[#0f141c]/95 via-[#0f141c]/80 to-[#0f141c]/70">
            <CardContent className="p-8">
              <div className="mb-4 text-lg font-semibold text-neutral-100">
                {msg}
              </div>
              <Button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 border border-neutral-800 bg-neutral-900/70 text-neutral-200 hover:bg-neutral-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Quay lại
              </Button>
            </CardContent>
          </Card>
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
        {renderHeader("Xem chi tiết hồ sơ người dùng")}

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
                      fullName || `User ${validUid}`,
                    )}`;
                  }}
                />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xl font-semibold text-neutral-100">
                  {fullName}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                  <span className="inline-flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900/70 px-3 py-1 text-neutral-200">
                    <span className="opacity-70">UserId</span>
                    <span className="font-medium text-neutral-100">
                      #{validUid}
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900/70 px-3 py-1 text-neutral-200">
                    <Shield className="h-4 w-4 opacity-70" />
                    <span className="opacity-70">Vai trò</span>
                    <span className="font-medium text-neutral-100">
                      {rolesLoading
                        ? "Đang tải…"
                        : rolesError
                          ? "—"
                          : roleNames.length
                            ? roleNames.join(", ")
                            : "—"}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="order-1 rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4">
                <div className="mb-1 text-xs tracking-wider text-neutral-400 uppercase">
                  Họ và tên
                </div>
                <div className="text-neutral-100">{fullName}</div>
              </div>

              <div className="order-2 rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4">
                <div className="mb-1 flex items-center gap-2 text-xs tracking-wider text-neutral-400 uppercase">
                  <MapPin className="h-3.5 w-3.5 opacity-70" />
                  Địa chỉ
                </div>
                <div className="text-neutral-100">{address}</div>
              </div>

              <div className="order-3 rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4 sm:col-span-2">
                <div className="mb-3 flex items-center gap-2 text-xs tracking-wider text-neutral-400 uppercase">
                  <Tag className="h-3.5 w-3.5 opacity-70" />
                  Kỹ năng
                </div>

                {skillsLoading ? (
                  <div className="inline-flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900/70 px-3 py-2 text-sm text-neutral-200">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Đang tải…</span>
                  </div>
                ) : skillsError ? (
                  <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3 text-sm text-rose-300">
                    Không thể tải danh sách kỹ năng.
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
                    — Chưa có kỹ năng —
                  </div>
                )}
              </div>

              <div className="order-4 rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4 sm:col-span-2">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs tracking-wider text-neutral-400 uppercase">
                    <Shield className="h-3.5 w-3.5 opacity-70" />
                    Quyền (roles)
                  </div>
                </div>

                {rolesLoading ? (
                  <div className="inline-flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900/70 px-3 py-2 text-sm text-neutral-200">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Đang tải…</span>
                  </div>
                ) : rolesError ? (
                  <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3 text-sm text-rose-300">
                    Không thể tải danh sách quyền.
                  </div>
                ) : roleNames.length ? (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {roleNames.map((r) => (
                      <span
                        key={r}
                        className="inline-flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/70 px-3 py-1 text-sm text-neutral-100"
                      >
                        {r}
                        <button
                          type="button"
                          onClick={() =>
                            deleteRoles.mutate({
                              userId: validUid,
                              roles: [r],
                            })
                          }
                          className="rounded-md p-1 hover:bg-neutral-800"
                          title="Xoá quyền này"
                          disabled={deleteRoles.isPending}
                        >
                          <X className="h-3.5 w-3.5 opacity-70" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="mb-3 rounded-xl border border-neutral-800 bg-neutral-900/60 p-3 text-sm text-neutral-300">
                    — Chưa có quyền —
                  </div>
                )}

                <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3">
                  <div className="mb-2 text-sm font-medium text-neutral-100">
                    Thêm quyền
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedRole}
                      onChange={(e) =>
                        setSelectedRole(e.target.value as RoleName | "")
                      }
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-900/70 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-amber-400/60 focus:ring-4 focus:ring-amber-400/20"
                    >
                      <option value="">— Chọn quyền —</option>
                      {availableOptions.map((opt) => (
                        <option
                          key={opt.value}
                          value={opt.value}
                          disabled={opt.disabled}
                        >
                          {opt.label} {opt.disabled ? "(đã có)" : ""}
                        </option>
                      ))}
                    </select>

                    <Button
                      type="button"
                      onClick={handleAddRole}
                      disabled={!canAdd}
                      className="h-9 border border-amber-500/40 bg-gradient-to-tr from-amber-500 to-orange-600 px-4 text-white"
                      title={
                        selectedRole === ""
                          ? "Chọn 1 quyền để thêm"
                          : roleNames.includes(selectedRole)
                            ? "Quyền đã tồn tại"
                            : undefined
                      }
                    >
                      {addRoles.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Đang thêm…
                        </>
                      ) : (
                        <>
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Thêm quyền
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="mt-2 text-xs text-neutral-400">
                    Mỗi lần chỉ thêm 01 quyền. Không được thêm trùng quyền đã
                    có.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 border border-neutral-800 bg-neutral-900/70 text-neutral-200 hover:bg-neutral-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Quay lại
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
