import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { createUserProfile } from "@/services/userProfileService";
import { uploadFileToUrl } from "@/services/fileService";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/globals/atoms/card";
import { Button } from "@/components/globals/atoms/button";
import { Input } from "@/components/globals/atoms/input";
import { Label } from "@/components/globals/atoms/label";
import {
  ArrowLeft,
  BadgeCheck,
  Camera,
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
  Mail,
  UserRound,
} from "lucide-react";

const schema = z.object({
  fullName: z.string().min(3, "Họ tên tối thiểu 3 ký tự"),
  address: z.string().min(3, "Địa chỉ tối thiểu 3 ký tự"),
  avatarUrl: z.string().url("URL không hợp lệ").optional().or(z.literal("")),
  coverUrl: z.string().url("URL không hợp lệ").optional().or(z.literal("")),
});
type FormType = z.infer<typeof schema>;

const base64UrlDecode = (s: string) => {
  let t = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = t.length % 4;
  if (pad) t += "=".repeat(4 - pad);
  const decoded = atob(t);
  try {
    return decodeURIComponent(
      decoded
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join(""),
    );
  } catch {
    return decoded;
  }
};

function parseJwtRaw(token: string): Record<string, unknown> | null {
  try {
    const payloadStr = base64UrlDecode(token.split(".")[1] || "");
    return JSON.parse(payloadStr) as Record<string, unknown>;
  } catch {
    return null;
  }
}

const isFileImage = (f: File) => /^image\//i.test(f.type);

export default function CreateProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("accessToken") || ""
      : "";
  const rawClaims = useMemo(() => (token ? parseJwtRaw(token) : null), [token]);
  const userId = useMemo(() => {
    const keys = ["id", "nameid", "sub"];
    for (const k of keys) {
      const v = rawClaims?.[k as keyof typeof rawClaims];
      if (typeof v === "number") return v;
      if (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v)))
        return Number(v);
    }
    return 0;
  }, [rawClaims]);

  const role = user?.role || "";
  const email = user?.email || "";
  const uname = user?.unique_name || "";
  const baseName = email
    ? email.split("@")[0]
    : uname || (userId ? `User ${userId}` : "");

  const roleRoutes: Record<string, string> = {
    Supervisor: "/supervisors/topics/myTopic-page",
    Administrator: "/admins/dashboard/overview",
    Moderator: "/moderators/dashboard",
    Reviewer: "/reviewers/dashboard/assigned-count",
  };

  const [submitting, setSubmitting] = useState(false);
  const [justCreated, setJustCreated] = useState(false);
  const [submittedOnce, setSubmittedOnce] = useState(false);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      if (coverPreview) URL.revokeObjectURL(coverPreview);
    };
  }, [avatarPreview, coverPreview]);

  const form = useForm<FormType>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: baseName,
      address: "",
      avatarUrl: "",
      coverUrl: "",
    },
    mode: "onChange",
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    watch,
  } = form;

  const pickAvatar = () => avatarInputRef.current?.click();
  const pickCover = () => coverInputRef.current?.click();

  const onAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || !isFileImage(f)) return;
    setAvatarFile(f);
    const url = URL.createObjectURL(f);
    setAvatarPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
    setValue("avatarUrl", "");
  };

  const onCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || !isFileImage(f)) return;
    setCoverFile(f);
    const url = URL.createObjectURL(f);
    setCoverPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
    setValue("coverUrl", "");
  };

  const hasAvatar = !!avatarFile || !!getValues("avatarUrl");
  const hasCover = !!coverFile || !!getValues("coverUrl");

  const onInvalid = () => {
    setSubmittedOnce(true);
    const firstErr =
      errors.fullName?.message ||
      errors.address?.message ||
      "Vui lòng điền đầy đủ thông tin bắt buộc.";
    toast.error(firstErr);
  };

  const onSubmit = async (data: FormType) => {
    setSubmittedOnce(true);
    if (!userId) {
      toast.error("Không tìm thấy userId trong token. Vui lòng đăng nhập lại.");
      return;
    }
    if (!hasAvatar && !hasCover) {
      toast.error("Vui lòng chọn ảnh đại diện và ảnh bìa.");
      return;
    }
    if (!hasAvatar) {
      toast.error("Vui lòng chọn ảnh đại diện.");
      return;
    }
    if (!hasCover) {
      toast.error("Vui lòng chọn ảnh bìa.");
      return;
    }
    setSubmitting(true);
    try {
      let avatarFinal = (data.avatarUrl || "").trim();
      let coverFinal = (data.coverUrl || "").trim();
      if (avatarFile) avatarFinal = await uploadFileToUrl(avatarFile);
      if (coverFile) coverFinal = await uploadFileToUrl(coverFile);

      await createUserProfile({
        userId,
        fullName: data.fullName,
        address: data.address || "",
        avatar: avatarFinal,
        coverImage: coverFinal,
      });
      setJustCreated(true);
      setTimeout(() => navigate(roleRoutes[role] || "/"), 2000);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "";
      if (msg.toLowerCase().includes("đã tồn tại")) {
        setJustCreated(true);
        setTimeout(() => navigate(roleRoutes[role] || "/"), 2000);
      } else {
        toast.error(msg || "Tạo hồ sơ thất bại.");
        setSubmitting(false);
      }
    }
  };

  const gotoBack = () => navigate(-1);

  const fallbackCover =
    coverPreview ||
    getValues("coverUrl") ||
    "https://images.unsplash.com/photo-1520975922329-0003f0327bb3?q=80&w=1600&auto=format&fit=crop";
  const fallbackAvatar =
    avatarPreview ||
    getValues("avatarUrl") ||
    "https://api.dicebear.com/7.x/initials/svg?seed=" +
      encodeURIComponent(baseName || "U");

  const nameLive = watch("fullName");

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
                CapBot • Tạo hồ sơ
              </div>
              <div className="text-xs tracking-wide text-neutral-400 sm:text-sm">
                Hoàn tất thông tin để sử dụng hệ thống
              </div>
            </div>
          </div>
        </div>

        <Card className="relative overflow-hidden rounded-3xl border border-neutral-800 bg-gradient-to-b from-[#0f141c]/95 via-[#0f141c]/80 to-[#0f141c]/70 shadow-[0_20px_80px_rgba(0,0,0,.5)] backdrop-blur">
          {submitting && !justCreated && (
            <div className="absolute inset-0 z-20 grid place-items-center bg-black/60 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-neutral-800 bg-neutral-900/80 px-6 py-5">
                <Loader2 className="h-6 w-6 animate-spin" />
                <div className="text-sm">Đang tạo hồ sơ...</div>
              </div>
            </div>
          )}
          {justCreated && (
            <div className="absolute inset-0 z-20 grid place-items-center bg-black/70 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-emerald-700/40 bg-emerald-600/10 px-6 py-5">
                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                <div className="text-sm">Tạo tài khoản thành công</div>
                <div className="text-xs text-neutral-300">
                  Đang chuyển hướng...
                </div>
              </div>
            </div>
          )}

          <div className="h-44 w-full overflow-hidden">
            <div className="relative h-full w-full">
              <img
                src={fallbackCover}
                alt=""
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f141c]/75 to-transparent" />
              <div className="absolute right-4 bottom-4 flex gap-2">
                <Button
                  type="button"
                  onClick={pickCover}
                  className="inline-flex items-center gap-2 border border-neutral-700 bg-neutral-900/70 text-neutral-100 hover:bg-neutral-900"
                >
                  <ImageIcon className="h-4 w-4" />
                  Thay ảnh bìa
                </Button>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onCoverFileChange}
                />
              </div>
            </div>
          </div>

          <CardContent className="p-6 sm:p-8">
            <div className="-mt-16 mb-6 flex items-end gap-4">
              <div className="relative">
                <img
                  src={fallbackAvatar}
                  alt=""
                  className="h-28 w-28 rounded-2xl border-4 border-[#0f141c] object-cover shadow-[0_10px_30px_rgba(0,0,0,.45)]"
                />
                <button
                  type="button"
                  onClick={pickAvatar}
                  className="group absolute -right-2 -bottom-2 flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900/70 hover:bg-neutral-900"
                >
                  <Camera className="h-4 w-4 text-neutral-200 group-hover:text-neutral-100" />
                </button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onAvatarFileChange}
                />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xl font-semibold text-neutral-100">
                  {nameLive || baseName || "Người dùng"}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                  <span className="inline-flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900/70 px-3 py-1 text-neutral-200">
                    <Mail className="h-4 w-4 opacity-70" />
                    <span className="truncate">{email || "—"}</span>
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900/70 px-3 py-1 text-neutral-200">
                    <span className="opacity-70">Vai trò</span>
                    <span className="font-medium text-neutral-100">
                      {role || "—"}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit, onInvalid)}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="fullName" className="text-neutral-200">
                    Họ và tên
                  </Label>
                  <Input
                    id="fullName"
                    placeholder="Nhập họ tên"
                    className="mt-2 border-neutral-700 bg-neutral-900/70 text-neutral-100 placeholder:text-neutral-400 focus-visible:border-amber-400/40 focus-visible:ring-2 focus-visible:ring-amber-400/60"
                    {...register("fullName")}
                  />
                  {submittedOnce && errors.fullName && (
                    <p className="mt-1 text-sm text-amber-300">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="address" className="text-neutral-200">
                    Địa chỉ
                  </Label>
                  <Input
                    id="address"
                    placeholder="Nhập địa chỉ"
                    className="mt-2 border-neutral-700 bg-neutral-900/70 text-neutral-100 placeholder:text-neutral-400 focus-visible:border-amber-400/40 focus-visible:ring-2 focus-visible:ring-amber-400/60"
                    {...register("address")}
                  />
                  {submittedOnce && errors.address && (
                    <p className="mt-1 text-sm text-amber-300">
                      {errors.address.message}
                    </p>
                  )}
                </div>
              </div>

              <input type="hidden" {...register("avatarUrl")} />
              <input type="hidden" {...register("coverUrl")} />

              {submittedOnce && !hasCover && (
                <p className="text-sm text-amber-300">Vui lòng chọn ảnh bìa.</p>
              )}
              {submittedOnce && !hasAvatar && (
                <p className="text-sm text-amber-300">
                  Vui lòng chọn ảnh đại diện.
                </p>
              )}

              <Button
                type="submit"
                onClick={() => setSubmittedOnce(true)}
                disabled={submitting || justCreated}
                className="w-full border border-amber-500/40 bg-gradient-to-tr from-amber-500 to-orange-600 text-white shadow-[0_10px_35px_rgba(245,158,11,.35)] transition hover:shadow-[0_14px_45px_rgba(245,158,11,.5)] focus-visible:ring-2 focus-visible:ring-amber-400/60 disabled:opacity-60"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang tạo hồ sơ...
                  </span>
                ) : (
                  <>
                    <UserRound className="mr-2 h-4 w-4" />
                    Tạo hồ sơ
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-4">
          <button
            onClick={gotoBack}
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
