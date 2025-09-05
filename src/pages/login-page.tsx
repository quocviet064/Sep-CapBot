import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  Shield,
  Mail,
  LockKeyhole,
  ChevronDown,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/globals/atoms/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/globals/atoms/card";
import { Input } from "@/components/globals/atoms/input";
import { Label } from "@/components/globals/atoms/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/globals/atoms/tabs";
import { Switch } from "@/components/globals/atoms/switch";
import { parseJwt, useAuth } from "@/contexts/AuthContext";
import {
  loginUserSchema,
  LoginUserType,
  RegisterType,
  registerSchema,
  roles as ROLE_OPTIONS,
} from "@/schemas/userSchema";
import { toast } from "sonner";
import { tryGetMyUserProfile } from "@/services/userProfileService";

function LoginPage() {
  const navigate = useNavigate();
  const { login, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isVisibleLogin, setIsVisibleLogin] = useState(false);
  const [isVisibleRegister, setIsVisibleRegister] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  useEffect(() => {
    logout();
  }, []);

  const loginForm = useForm<LoginUserType>({
    resolver: zodResolver(loginUserSchema),
    defaultValues: {
      emailOrUsername: "viet@gmail.com",
      password: "123Aa@",
      role: "Supervisor",
    },
  });
  const registerForm = useForm<RegisterType>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: "", phoneNumber: "", email: "", password: "" },
  });

  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = loginForm;

  const {
    register: registerRegister,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors },
  } = registerForm;

  const onSubmitLogin = async (data: LoginUserType) => {
    setIsLoading(true);
    try {
      await login(data.emailOrUsername, data.password, data.role);
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Không tìm thấy accessToken");
      const payload = parseJwt(token);
      const role = data.role || payload?.role;
      const roleRoutes: Record<string, string> = {
        Supervisor: "/supervisors/topics/myTopic-page",
        Administrator: "/admins/dashboard/overview",
        Moderator: "/moderators/dashboard",
        Reviewer: "/reviewers/dashboard/assigned-count",
      };
      const prof = await tryGetMyUserProfile();
      if (prof) {
        toast("Login thành công");
        navigate(roleRoutes[role] || "/");
      } else {
        navigate("/profile/CreateProfilePage");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitRegister = async (data: RegisterType) => {
    setIsLoading(true);
    try {
      console.log("register", JSON.stringify(data, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-neutral-950">
      <div className="pointer-events-none absolute top-[-180px] left-[-180px] h-[520px] w-[520px] rounded-full bg-gradient-to-br from-orange-500/30 via-amber-400/25 to-transparent blur-[120px]" />
      <div className="pointer-events-none absolute right-[-220px] bottom-[-220px] h-[620px] w-[620px] rounded-full bg-gradient-to-tr from-rose-400/25 via-orange-500/20 to-transparent blur-[140px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,.06),transparent_40%),radial-gradient(ellipse_at_bottom,rgba(255,255,255,.05),transparent_40%)]" />
      <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,rgba(255,255,255,.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.06)_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.06]" />

      <div className="relative mx-auto grid min-h-screen max-w-6xl grid-cols-1 gap-8 px-5 py-10 lg:grid-cols-2 lg:gap-12">
        <div className="flex items-center">
          <div className="relative w-full overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-neutral-900/70 via-neutral-900/50 to-neutral-800/60 p-7 text-white shadow-[0_20px_80px_rgba(0,0,0,.45)] backdrop-blur-xl">
            <div className="absolute inset-0 -z-10 rounded-3xl [mask-composite:exclude] p-[1px] [background:conic-gradient(from_140deg_at_50%_50%,rgba(255,115,0,.45),rgba(245,158,11,.3),transparent_60%)] [mask:linear-gradient(#000,#000)_content-box,linear-gradient(#000,#000)]" />
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-b from-orange-500 to-amber-500 shadow-lg">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs tracking-wider text-white/70 uppercase">
                  CapBot
                </p>
                <h1 className="text-xl font-semibold">Cổng xét duyệt đề tài</h1>
              </div>
            </div>

            <div className="mt-8 space-y-6">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-start gap-3">
                  <Sparkles className="mt-1 h-5 w-5 text-amber-300" />
                  <div>
                    <p className="text-base font-medium">
                      Trải nghiệm chuyên nghiệp
                    </p>
                    <p className="mt-1 text-sm text-white/70"></p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 h-5 w-5 text-emerald-300" />
                  <div>
                    <p className="text-base font-medium">
                      Bảo mật & phân quyền
                    </p>
                    <p className="mt-1 text-sm text-white/70">
                      Định tuyến thông minh theo Administrator, Moderator,
                      Supervisor, Reviewer.
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-start gap-3">
                  <Shield className="mt-1 h-5 w-5 text-sky-300" />
                  <div>
                    <p className="text-base font-medium">Hệ sinh thái nội bộ</p>
                    <p className="mt-1 text-sm text-white/70">
                      Chỉ sử dụng email nội bộ được cấp quyền thôi nhé!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pointer-events-none absolute -top-8 -right-8 h-40 w-40 rounded-full bg-orange-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-amber-400/10 blur-3xl" />
          </div>
        </div>

        <div className="flex items-center">
          <div className="relative w-full overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-neutral-900/70 via-neutral-900/50 to-neutral-800/60 p-4 text-white shadow-[0_20px_80px_rgba(0,0,0,.45)] backdrop-blur-xl">
            <div className="absolute inset-0 -z-10 rounded-3xl [mask-composite:exclude] p-[1px] [background:conic-gradient(from_200deg_at_50%_50%,rgba(255,115,0,.5),rgba(245,158,11,.35),transparent_60%)] [mask:linear-gradient(#000,#000)_content-box,linear-gradient(#000,#000)]" />
            <Tabs defaultValue="login" className="space-y-5">
              <TabsList className="grid h-11 w-full grid-cols-2 rounded-xl bg-white/10 p-1">
                <TabsTrigger
                  value="login"
                  className="rounded-lg text-white/90 transition-all data-[state=active]:bg-gradient-to-tr data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white data-[state=active]:shadow-md"
                  disabled={isLoading}
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Đăng nhập
                </TabsTrigger>
                <TabsTrigger
                  value="register"
                  className="rounded-lg text-white/90 transition-all data-[state=active]:bg-gradient-to-tr data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white data-[state=active]:shadow-md"
                  disabled={isLoading}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Đăng ký
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLoginSubmit(onSubmitLogin)}>
                  <Card className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/10 shadow-2xl backdrop-blur-xl">
                    <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white">
                        Chào mừng quay lại
                      </CardTitle>
                      <CardDescription className="text-white/75">
                        Đăng nhập bằng email/username và vai trò của bạn
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div>
                        <Label htmlFor="email" className="text-white">
                          Email / Username
                        </Label>
                        <div className="relative mt-2">
                          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex w-10 items-center justify-center text-white/70">
                            <Mail className="h-4 w-4" />
                          </div>
                          <Input
                            id="email"
                            type="text"
                            placeholder="name@domain.edu.vn"
                            className="border-white/20 bg-white/10 pl-10 text-white placeholder:text-white/60 focus-visible:ring-orange-400/50"
                            {...loginRegister("emailOrUsername")}
                          />
                        </div>
                        {loginErrors.emailOrUsername && (
                          <p className="mt-1 ml-1 text-sm text-amber-300">
                            {loginErrors.emailOrUsername.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="password" className="text-white">
                          Mật khẩu
                        </Label>
                        <div className="relative mt-2">
                          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex w-10 items-center justify-center text-white/70">
                            <LockKeyhole className="h-4 w-4" />
                          </div>
                          <Input
                            id="password"
                            type={isVisibleLogin ? "text" : "password"}
                            placeholder="••••••••"
                            className="border-white/20 bg-white/10 pr-10 pl-10 text-white placeholder:text-white/60 focus-visible:ring-orange-400/50"
                            {...loginRegister("password")}
                          />
                          <button
                            type="button"
                            onClick={() => setIsVisibleLogin((v) => !v)}
                            className="absolute inset-y-0 right-0 flex h-full w-9 items-center justify-center text-white/80 transition hover:text-white"
                            aria-label={
                              isVisibleLogin ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                            }
                            aria-pressed={isVisibleLogin}
                          >
                            {isVisibleLogin ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </button>
                        </div>
                        {loginErrors.password && (
                          <p className="mt-1 ml-1 text-sm text-amber-300">
                            {loginErrors.password.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="role" className="text-white">
                          Vai trò
                        </Label>
                        <div className="group relative mt-2">
                          <div className="pointer-events-none absolute inset-0 -z-10 rounded-md opacity-0 transition-opacity [background:conic-gradient(from_180deg_at_50%_50%,rgba(255,115,0,0.35),rgba(245,158,11,0.25),transparent_60%)] group-focus-within:opacity-100" />
                          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex w-10 items-center justify-center text-white/70">
                            <Shield className="h-4 w-4" />
                          </div>
                          <select
                            id="role"
                            className="relative z-10 h-10 w-full appearance-none rounded-md border border-white/20 bg-white/10 pr-9 pl-10 text-sm text-white backdrop-blur transition outline-none placeholder:text-white/60 hover:bg-white/15 focus:ring-2 focus:ring-orange-400/40"
                            {...loginRegister("role")}
                          >
                            {ROLE_OPTIONS.map((r) => (
                              <option
                                key={r}
                                value={r}
                                className="bg-neutral-900 text-white"
                              >
                                {r}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="pointer-events-none absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 text-white/70 transition-colors group-focus-within:text-white" />
                        </div>
                        {loginErrors.role && (
                          <p className="mt-1 ml-1 text-sm text-amber-300">
                            {loginErrors.role.message}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={rememberMe}
                            onCheckedChange={setRememberMe}
                            aria-label="Ghi nhớ đăng nhập"
                          />
                          <span className="text-sm text-white">
                            Ghi nhớ đăng nhập
                          </span>
                        </div>
                        <span className="text-xs text-white/70">
                          Cần hỗ trợ? Liên hệ quản trị
                        </span>
                      </div>
                    </CardContent>
                    <CardFooter className="flex w-full flex-col gap-2">
                      <Button
                        type="submit"
                        disabled={isLoading}
                        size="lg"
                        className="w-full bg-gradient-to-tr from-orange-500 to-amber-500 text-white shadow-lg transition hover:shadow-xl focus-visible:ring-2 focus-visible:ring-orange-400/50"
                      >
                        {isLoading ? "Đang xử lý..." : "Đăng nhập"}
                      </Button>
                      <p className="text-center text-xs text-white/70">
                        Dành cho giảng viên. Sinh viên vui lòng dùng cổng riêng.
                      </p>
                    </CardFooter>
                  </Card>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegisterSubmit(onSubmitRegister)}>
                  <Card className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/10 text-white shadow-2xl backdrop-blur-xl">
                    <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />
                    <CardHeader className="pb-3">
                      <CardTitle>Đăng ký tài khoản</CardTitle>
                      <CardDescription className="text-white/75">
                        Tạo tài khoản mới theo quy trình nội bộ
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-5">
                      <div>
                        <Label htmlFor="fullName" className="text-white">
                          Họ và tên
                        </Label>
                        <Input
                          id="fullName"
                          placeholder="Nhập họ tên"
                          className="mt-2 border-white/20 bg-white/10 text-white placeholder:text-white/60 focus-visible:ring-orange-400/50"
                          {...registerRegister("fullName")}
                        />
                        {registerErrors.fullName && (
                          <p className="mt-1 text-sm text-amber-300">
                            {registerErrors.fullName.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="phoneNumber" className="text-white">
                          Số điện thoại
                        </Label>
                        <Input
                          id="phoneNumber"
                          placeholder="Nhập số điện thoại"
                          className="mt-2 border-white/20 bg-white/10 text-white placeholder:text-white/60 focus-visible:ring-orange-400/50"
                          {...registerRegister("phoneNumber")}
                        />
                        {registerErrors.phoneNumber && (
                          <p className="mt-1 text-sm text-amber-300">
                            {registerErrors.phoneNumber.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="email" className="text-white">
                          Email
                        </Label>
                        <Input
                          id="email"
                          placeholder="Nhập email"
                          className="mt-2 border-white/20 bg-white/10 text-white placeholder:text-white/60 focus-visible:ring-orange-400/50"
                          {...registerRegister("email")}
                        />
                        {registerErrors.email && (
                          <p className="mt-1 text-sm text-amber-300">
                            {registerErrors.email.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="reg-password" className="text-white">
                          Mật khẩu
                        </Label>
                        <div className="relative mt-2">
                          <Input
                            id="reg-password"
                            type={isVisibleRegister ? "text" : "password"}
                            placeholder="Tạo mật khẩu"
                            className="border-white/20 bg-white/10 pr-10 text-white placeholder:text-white/60 focus-visible:ring-orange-400/50"
                            {...registerRegister("password")}
                          />
                          <button
                            type="button"
                            onClick={() => setIsVisibleRegister((v) => !v)}
                            className="absolute inset-y-0 right-0 flex h-full w-9 items-center justify-center text-white/80 transition hover:text-white"
                            aria-label={
                              isVisibleRegister
                                ? "Ẩn mật khẩu"
                                : "Hiện mật khẩu"
                            }
                            aria-pressed={isVisibleRegister}
                          >
                            {isVisibleRegister ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </button>
                          <p className="text-center text-xl text-red-700/70">
                            Tài khoản của bạn đang chờ xét duyệt
                          </p>
                        </div>
                        {registerErrors.password && (
                          <p className="mt-1 text-sm text-amber-300">
                            {registerErrors.password.message}
                          </p>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex w-full flex-col gap-2">
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-tr from-orange-500 to-amber-500 text-white shadow-lg transition hover:shadow-xl focus-visible:ring-2 focus-visible:ring-orange-400/50"
                      >
                        {isLoading ? "Đang xử lý..." : "Đăng ký"}
                      </Button>
                      <p className="text-center text-xs text-white/70">
                        Việc cấp quyền được phê duyệt bởi quản trị viên.
                      </p>
                    </CardFooter>
                  </Card>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
