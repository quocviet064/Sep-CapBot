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
  AlertCircle,
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

type FieldInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};
function FieldInput({ invalid, className, ...props }: FieldInputProps) {
  return (
    <input
      {...props}
      className={[
        "w-full rounded-xl border px-3.5 py-2.5 text-sm shadow-inner outline-none",
        invalid
          ? "border-red-300 bg-white focus:border-red-400 focus:ring-4 focus:ring-red-200/60"
          : "border-neutral-200 bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-200/60",
        className || "",
      ].join(" ")}
    />
  );
}

type FieldSelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  invalid?: boolean;
};
function FieldSelect({ invalid, className, ...props }: FieldSelectProps) {
  return (
    <select
      {...props}
      className={[
        "w-full rounded-xl border px-3.5 py-2.5 text-sm shadow-inner outline-none",
        invalid
          ? "border-red-300 bg-white focus:border-red-400 focus:ring-4 focus:ring-red-200/60"
          : "border-neutral-200 bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-200/60",
        className || "",
      ].join(" ")}
    />
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="mt-1.5 flex items-start gap-1.5 text-xs text-red-600">
      <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-none" />
      <span>{message}</span>
    </div>
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

const getPwdMetrics = (pwd: string) => {
  const lengthOk = pwd.length >= 6;
  const lowerOk = /[a-z]/.test(pwd);
  const upperOk = /[A-Z]/.test(pwd);
  const numberOk = /\d/.test(pwd);
  const symbolOk = /[^A-Za-z0-9]/.test(pwd);
  const score = [lengthOk, lowerOk, upperOk, numberOk, symbolOk].filter(
    Boolean,
  ).length;
  return { lengthOk, lowerOk, upperOk, numberOk, symbolOk, score };
};

function PasswordStrengthBar({ password }: { password: string }) {
  const { score } = getPwdMetrics(password);
  const pct = (score / 5) * 100;
  const color =
    score <= 2
      ? "bg-red-500"
      : score === 3
        ? "bg-orange-500"
        : score === 4
          ? "bg-amber-500"
          : "bg-green-500";
  const label =
    score <= 1
      ? "Rất yếu"
      : score === 2
        ? "Yếu"
        : score === 3
          ? "Trung bình"
          : score === 4
            ? "Mạnh"
            : "Rất mạnh";
  const labelColor =
    score <= 2
      ? "text-red-600"
      : score === 3
        ? "text-orange-600"
        : score === 4
          ? "text-amber-600"
          : "text-green-600";
  return (
    <div className="mt-2">
      <div className="h-2 w-full rounded-full bg-neutral-200">
        <div
          className={["h-2 rounded-full transition-all", color].join(" ")}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className={["mt-1.5 text-xs font-medium", labelColor].join(" ")}>
        {label}
      </div>
    </div>
  );
}

interface AdminUserCreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type Touched = Partial<
  Record<
    | "email"
    | "phoneNumber"
    | "userName"
    | "password"
    | "confirmPassword"
    | "role",
    boolean
  >
>;

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
  const [touched, setTouched] = useState<Touched>({});
  const [submitted, setSubmitted] = useState(false);

  const { mutate, isPending, isSuccess } = useRegisterUser();

  const errors = useMemo(() => {
    const e: Partial<Record<keyof RegisterUserDTO, string>> = {};
    const email = form.email.trim();
    const userName = form.userName.trim();
    const phone = (form.phoneNumber || "").trim();
    const { lengthOk, lowerOk, upperOk, numberOk, symbolOk } = getPwdMetrics(
      form.password,
    );

    if (!email) e.email = "Vui lòng nhập email";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Email không hợp lệ";

    if (!userName) e.userName = "Vui lòng nhập tên đăng nhập";
    else if (userName.length < 3)
      e.userName = "Tên đăng nhập tối thiểu 3 ký tự";

    if (!phone) e.phoneNumber = "Vui lòng nhập số điện thoại";
    else if (!/^(0\d{9}|(\+84)\d{9})$/.test(phone))
      e.phoneNumber =
        "Số điện thoại không hợp lệ (0xxxxxxxxx hoặc +84xxxxxxxxx)";

    if (!form.password) e.password = "Vui lòng nhập mật khẩu";
    else if (!lengthOk) e.password = "Mật khẩu tối thiểu 6 ký tự";
    else if (!(lowerOk && upperOk && numberOk && symbolOk))
      e.password = "Mật khẩu phải có chữ thường, chữ hoa, số và ký tự đặc biệt";

    if (!form.confirmPassword) e.confirmPassword = "Vui lòng xác nhận mật khẩu";
    else if (form.confirmPassword !== form.password)
      e.confirmPassword = "Xác nhận mật khẩu không khớp";

    if (!roles.includes(form.role)) e.role = "Vai trò không hợp lệ";
    return e;
  }, [form]);

  const showErr = (key: keyof RegisterUserDTO): string | undefined => {
    if (!(submitted || touched[key])) return undefined;
    return errors[key];
  };

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
      setTouched({});
      setSubmitted(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isSuccess) onClose();
  }, [isSuccess, onClose]);

  const markTouched = (key: keyof Touched) => () =>
    setTouched((p) => ({ ...p, [key]: true }));

  const handleCreate = () => {
    setSubmitted(true);
    if (Object.keys(errors).length > 0) return;
    mutate({
      email: form.email.trim(),
      phoneNumber: form.phoneNumber?.trim() || "",
      userName: form.userName.trim(),
      password: form.password,
      confirmPassword: form.confirmPassword,
      role: form.role,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[760px] max-w-[96vw] overflow-hidden p-0">
        <form
          autoComplete="off"
          onSubmit={(e) => {
            e.preventDefault();
            handleCreate();
          }}
        >
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
                <div>
                  <FieldInput
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, email: e.target.value }))
                    }
                    onBlur={markTouched("email")}
                    placeholder="user@example.com"
                    autoComplete="off"
                    name="adminNewEmail"
                    invalid={!!showErr("email")}
                  />
                  <FieldError message={showErr("email")} />
                </div>
              </Row>
              <div className="border-t" />
              <Row label="Số điện thoại">
                <div>
                  <FieldInput
                    value={form.phoneNumber || ""}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, phoneNumber: e.target.value }))
                    }
                    onBlur={markTouched("phoneNumber")}
                    placeholder="Nhập số điện thoại"
                    inputMode="tel"
                    autoComplete="tel"
                    name="adminNewPhone"
                    invalid={!!showErr("phoneNumber")}
                  />
                  <FieldError message={showErr("phoneNumber")} />
                </div>
              </Row>
              <div className="border-t" />
              <Row label="Tên đăng nhập">
                <div>
                  <FieldInput
                    value={form.userName}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, userName: e.target.value }))
                    }
                    onBlur={markTouched("userName")}
                    placeholder="Tên đăng nhập"
                    maxLength={50}
                    autoComplete="off"
                    name="adminNewUsername"
                    invalid={!!showErr("userName")}
                  />
                  <FieldError message={showErr("userName")} />
                </div>
              </Row>
              <div className="border-t" />
              <Row label="Vai trò">
                <div>
                  <FieldSelect
                    value={form.role}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        role: e.target.value as AdminCreatableRole,
                      }))
                    }
                    onBlur={markTouched("role")}
                    invalid={!!showErr("role")}
                    name="adminNewRole"
                  >
                    {roles.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </FieldSelect>
                  <FieldError message={showErr("role")} />
                </div>
              </Row>
              <div className="border-t" />
              <Row label="Mật khẩu">
                <div>
                  <div className="flex items-center gap-2">
                    <FieldInput
                      type={showPwd ? "text" : "password"}
                      value={form.password}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, password: e.target.value }))
                      }
                      onBlur={markTouched("password")}
                      placeholder="Nhập mật khẩu"
                      autoComplete="new-password"
                      name="adminNewPassword"
                      data-1p-ignore
                      data-lpignore="true"
                      invalid={!!showErr("password")}
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
                      type="button"
                    >
                      <UserPlus className="h-4 w-4" /> Tạo mật khẩu
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowPwd((s) => !s)}
                      className="px-3"
                      type="button"
                    >
                      {showPwd ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <FieldError message={showErr("password")} />
                  <PasswordStrengthBar password={form.password} />
                </div>
              </Row>
              <div className="border-t" />
              <Row label="Xác nhận mật khẩu">
                <div>
                  <div className="flex items-center gap-2">
                    <FieldInput
                      type={showPwd2 ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          confirmPassword: e.target.value,
                        }))
                      }
                      onBlur={markTouched("confirmPassword")}
                      placeholder="Nhập lại mật khẩu"
                      autoComplete="new-password"
                      name="adminConfirmPassword"
                      data-1p-ignore
                      data-lpignore="true"
                      invalid={!!showErr("confirmPassword")}
                    />
                    <Button
                      variant="outline"
                      onClick={() => setShowPwd2((s) => !s)}
                      className="px-3"
                      type="button"
                    >
                      {showPwd2 ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <FieldError message={showErr("confirmPassword")} />
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
                type="button"
              >
                <X className="h-4 w-4" /> Đóng
              </Button>
              <Button disabled={isPending} className="gap-2" type="submit">
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
        </form>
      </DialogContent>
    </Dialog>
  );
}
