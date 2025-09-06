import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { useMyProfile, useUpdateUserProfile } from "@/hooks/useUserProfile";
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
  User as UserIcon,
} from "lucide-react";
import { safeSrc } from "@/utils/safeSrc";
import { normalizeAssetUrl, toRelativeIfMatches } from "@/utils/assetUrl";

const isAbsoluteHttpUrl = (v: string) => /^https?:\/\//i.test(v);
const urlOrRelative = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .refine(
    (v) => !v || v.startsWith("/") || isAbsoluteHttpUrl(v),
    "URL/đường dẫn ảnh không hợp lệ",
  );

const schema = z.object({
  fullName: z.string().trim().min(3, "Họ tên tối thiểu 3 ký tự"),
  address: z.string().trim().min(3, "Địa chỉ tối thiểu 3 ký tự"),
  avatarUrl: urlOrRelative,
  coverUrl: urlOrRelative,
});
type FormType = z.infer<typeof schema>;

const isFileImage = (f: File) => /^image\//i.test(f.type);

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data, isLoading, isError, error } = useMyProfile();
  const updateMut = useUpdateUserProfile();

  const [submitting, setSubmitting] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
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
    defaultValues: { fullName: "", address: "", avatarUrl: "", coverUrl: "" },
    mode: "onChange",
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    watch,
    reset,
  } = form;

  useEffect(() => {
    if (data) {
      reset({
        fullName: data.fullName || "",
        address: data.address || "",

        avatarUrl: data.avatar || "",
        coverUrl: data.coverImage || "",
      });
    }
  }, [data, reset]);

  useEffect(() => {
    const status = axios.isAxiosError(error)
      ? error.response?.status
      : undefined;
    if (isError && status === 404) {
      navigate("/profile/CreateProfilePage", { replace: true });
    }
  }, [isError, error, navigate]);

  const email = user?.email || "—";
  const role = user?.role || "—";

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

  const onInvalid = (errs: typeof errors) => {
    setSubmittedOnce(true);
    const firstErr =
      errs.fullName?.message ||
      errs.address?.message ||
      errs.avatarUrl?.message ||
      errs.coverUrl?.message;
    toast.error(String(firstErr || "Vui lòng nhập đủ thông tin bắt buộc."));
  };

  const onSubmit = async (formData: FormType) => {
    if (!data) return;
    setSubmittedOnce(true);
    setSubmitting(true);
    try {
      let avatarFinal = (formData.avatarUrl || "").trim() || data.avatar || "";
      let coverFinal =
        (formData.coverUrl || "").trim() || data.coverImage || "";

      if (avatarFile) avatarFinal = await uploadFileToUrl(avatarFile, "image");
      if (coverFile) coverFinal = await uploadFileToUrl(coverFile, "image");

      avatarFinal = toRelativeIfMatches(avatarFinal);
      coverFinal = toRelativeIfMatches(coverFinal);

      await updateMut.mutateAsync({
        id: data.id,
        fullName: formData.fullName.trim(),
        address: formData.address.trim(),
        avatar: avatarFinal,
        coverImage: coverFinal,
      });

      setJustSaved(true);
      setTimeout(
        () => navigate("/profile/MyProfilePage", { replace: true }),
        1000,
      );
    } catch {
      setSubmitting(false);
    }
  };

  const nameLive = watch("fullName");

  const showCoverRaw =
    coverPreview ||
    getValues("coverUrl") ||
    data?.coverImage ||
    "https://images.unsplash.com/photo-1520975922329-0003f0327bb3?q=80&w=1600&auto=format&fit=crop";
  const showCover = safeSrc(normalizeAssetUrl(showCoverRaw));

  const avatarRaw = avatarPreview || getValues("avatarUrl") || data?.avatar;
  const showAvatar =
    safeSrc(normalizeAssetUrl(avatarRaw)) ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
      nameLive || data?.fullName || "U",
    )}`;

  if (isLoading) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-neutral-950 text-neutral-100">
        <div className="pointer-events-none absolute top-[-180px] left-[-180px] h-[520px] w-[520px] rounded-full bg-gradient-to-br from-orange-500/30 via-amber-400/25 to-transparent blur-[120px]" />
        <div className="pointer-events-none absolute right-[-220px] bottom-[-220px] h-[620px] w-[620px] rounded-full bg-gradient-to-tr from-rose-400/25 via-orange-500/20 to-transparent blur-[140px]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,.06),transparent_40%),radial-gradient(ellipse_at_bottom,rgba(255,255,255,.05),transparent_40%)]" />
        <div className="relative mx-auto max-w-5xl px-6 py-10">
          <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang tải hồ sơ…
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-red-400">Lỗi tải hồ sơ. Vui lòng thử lại.</div>
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
                CapBot • Chỉnh sửa hồ sơ
              </div>
              <div className="text-xs tracking-wide text-neutral-400 sm:text-sm">
                Cập nhật thông tin để trải nghiệm tốt hơn
              </div>
            </div>
          </div>
        </div>

        <Card className="relative overflow-hidden rounded-3xl border border-neutral-800 bg-gradient-to-b from-[#0f141c]/95 via-[#0f141c]/80 to-[#0f141c]/70 shadow-[0_20px_80px_rgba(0,0,0,.5)] backdrop-blur">
          {submitting && !justSaved && (
            <div className="absolute inset-0 z-20 grid place-items-center bg-black/60 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-neutral-800 bg-neutral-900/80 px-6 py-5">
                <Loader2 className="h-6 w-6 animate-spin" />
                <div className="text-sm">Đang lưu thay đổi...</div>
              </div>
            </div>
          )}
          {justSaved && (
            <div className="absolute inset-0 z-20 grid place-items-center bg-black/70 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-emerald-700/40 bg-emerald-600/10 px-6 py-5">
                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                <div className="text-sm">Cập nhật thành công</div>
                <div className="text-xs text-neutral-300">
                  Đang chuyển hướng...
                </div>
              </div>
            </div>
          )}

          <div className="h-44 w-full overflow-hidden">
            <div className="relative h-full w-full">
              <img
                src={showCover}
                alt=""
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
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
                  src={showAvatar}
                  alt=""
                  className="h-28 w-28 rounded-2xl border-4 border-[#0f141c] object-cover shadow-[0_10px_30px_rgba(0,0,0,.45)]"
                  onError={(e) => {
                    const img = e.currentTarget as HTMLImageElement;
                    img.onerror = null;
                    img.src =
                      "https://api.dicebear.com/7.x/initials/svg?seed=" +
                      encodeURIComponent(nameLive || data?.fullName || "U");
                  }}
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
                  {nameLive || data?.fullName || "Người dùng"}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                  <span className="inline-flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900/70 px-3 py-1 text-neutral-200">
                    <Mail className="h-4 w-4 opacity-70" />
                    <span className="truncate">{email}</span>
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900/70 px-3 py-1 text-neutral-200">
                    <UserIcon className="h-4 w-4 opacity-70" />
                    <span className="font-medium text-neutral-100">{role}</span>
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

              <Button
                type="submit"
                onClick={() => setSubmittedOnce(true)}
                disabled={submitting || justSaved}
                className="w-full border border-amber-500/40 bg-gradient-to-tr from-amber-500 to-orange-600 text-white shadow-[0_10px_35px_rgba(245,158,11,.35)] transition hover:shadow-[0_14px_45px_rgba(245,158,11,.5)] focus-visible:ring-2 focus-visible:ring-amber-400/60 disabled:opacity-60"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang lưu thay đổi...
                  </span>
                ) : (
                  <>
                    <UserRound className="mr-2 h-4 w-4" />
                    Lưu thay đổi
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-4">
          <button
            onClick={() => navigate("/profile/MyProfilePage")}
            className="inline-flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900/70 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại hồ sơ
          </button>
        </div>
      </div>
    </div>
  );
}
