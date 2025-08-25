import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/globals/atoms/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/globals/atoms/dialog";
import {
  Eye,
  EyeOff,
  Loader2,
  Save,
  ShieldCheck,
  UserPlus,
  X,
} from "lucide-react";
import { useRegisterUser } from "@/hooks/useAdminUser";
import type {
  AdminCreatableRole,
  RegisterUserDTO,
} from "@/services/authService";

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

const roles: AdminCreatableRole[] = ["Reviewer", "Moderator", "Supervisor"];

const genPassword = (len = 12): string => {
  const A = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const a = "abcdefghijkmnopqrstuvwxyz";
  const n = "0123456789";
  const s = "!@#$%^&*()-_=+[]{}<>?";
  const pick = (pool: string) => pool[Math.floor(Math.random() * pool.length)];
  const seed = [pick(A), pick(a), pick(n), pick(s)];
  const all = A + a + n + s;
  const rest: string[] = [];
  for (let i = 0; i < Math.max(0, len - seed.length); i++) rest.push(pick(all));
  const arr = [...seed, ...rest];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = arr[i];
    arr[i] = arr[j];
    arr[j] = t;
  }
  return arr.join("");
};

interface AdminUserCreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminUserCreateDialog({
  isOpen,
  onClose,
}: AdminUserCreateDialogProps) {
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);
  const [form, setForm] = useState<RegisterUserDTO>({
    email: "",
    phoneNumber: "",
    userName: "",
    password: "",
    confirmPassword: "",
    role: "Reviewer",
  });

  const { mutate, isPending, isSuccess } = useRegisterUser();

  const emailValid = useMemo(
    () => /\S+@\S+\.\S+/.test(form.email.trim()),
    [form.email],
  );
  const usernameValid = useMemo(
    () => form.userName.trim().length >= 3,
    [form.userName],
  );
  const passwordValid = useMemo(
    () => form.password.length >= 8,
    [form.password],
  );
  const confirmValid = useMemo(
    () => form.password === form.confirmPassword,
    [form.password, form.confirmPassword],
  );
  const roleValid = useMemo(() => roles.includes(form.role), [form.role]);

  const canSave =
    emailValid && usernameValid && passwordValid && confirmValid && roleValid;

  useEffect(() => {
    if (!isOpen) {
      setForm({
        email: "",
        phoneNumber: "",
        userName: "",
        password: "",
        confirmPassword: "",
        role: "Reviewer",
      });
      setShowPwd(false);
      setShowPwd2(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isSuccess) onClose();
  }, [isSuccess, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[760px] max-w-[96vw] overflow-hidden p-0">
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
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-[18px] font-semibold">
                  Tạo tài khoản Reviewer/Moderator/Supervisor
                </DialogTitle>
                <DialogDescription className="text-[12px] text-white/80">
                  Nhập thông tin và cấp quyền vai trò.
                </DialogDescription>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5 bg-neutral-50 px-6 py-6">
          <div className="rounded-2xl border border-neutral-200/70 bg-white/80 px-5 py-4 shadow-sm ring-1 ring-black/5 backdrop-blur">
            <Row label="Email">
              <FieldInput
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((p) => ({ ...p, email: e.target.value }))
                }
                placeholder="user@example.com"
              />
            </Row>
            <div className="border-t" />
            <Row label="Số điện thoại">
              <FieldInput
                value={form.phoneNumber || ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, phoneNumber: e.target.value }))
                }
                placeholder="Tùy chọn"
              />
            </Row>
            <div className="border-t" />
            <Row label="Tên đăng nhập">
              <FieldInput
                value={form.userName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, userName: e.target.value }))
                }
                placeholder="username"
                maxLength={50}
              />
            </Row>
            <div className="border-t" />
            <Row label="Vai trò">
              <FieldSelect
                value={form.role}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    role: e.target.value as AdminCreatableRole,
                  }))
                }
              >
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </FieldSelect>
            </Row>
            <div className="border-t" />
            <Row label="Mật khẩu">
              <div className="flex items-center gap-2">
                <FieldInput
                  type={showPwd ? "text" : "password"}
                  value={form.password}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, password: e.target.value }))
                  }
                  placeholder="Tối thiểu 8 ký tự"
                />
                <Button
                  variant="outline"
                  onClick={() =>
                    setForm((p) => ({
                      ...p,
                      password: genPassword(),
                      confirmPassword: "",
                    }))
                  }
                  className="gap-2"
                >
                  <UserPlus className="h-4 w-4" /> Tạo mật khẩu
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowPwd((s) => !s)}
                  className="px-3"
                >
                  {showPwd ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </Row>
            <div className="border-t" />
            <Row label="Xác nhận mật khẩu">
              <div className="flex items-center gap-2">
                <FieldInput
                  type={showPwd2 ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, confirmPassword: e.target.value }))
                  }
                  placeholder="Nhập lại mật khẩu"
                />
                <Button
                  variant="outline"
                  onClick={() => setShowPwd2((s) => !s)}
                  className="px-3"
                >
                  {showPwd2 ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </Row>
          </div>
        </div>

        <DialogFooter className="sticky bottom-0 z-10 border-t bg-white/85 px-6 py-4 backdrop-blur">
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isPending}
              className="gap-2"
            >
              <X className="h-4 w-4" /> Đóng
            </Button>
            <Button
              onClick={() =>
                mutate({
                  email: form.email.trim(),
                  phoneNumber: form.phoneNumber?.trim() || "",
                  userName: form.userName.trim(),
                  password: form.password,
                  confirmPassword: form.confirmPassword,
                  role: form.role,
                })
              }
              disabled={!canSave || isPending}
              className="gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Đang tạo...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Tạo tài khoản
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
