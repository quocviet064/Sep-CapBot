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
import { parseJwt, useAuth } from "@/contexts/AuthContext";
import {
  loginUserSchema,
  LoginUserType,
  RegisterType,
  registerSchema,
} from "@/schemas/userSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isVisibleLogin, setIsVisibleLogin] = useState<boolean>(false);
  const [isVisibleRegister, setIsVisibleRegister] = useState<boolean>(false);

  const { login, user } = useAuth();

  const toggleVisibilityLogin = () =>
    setIsVisibleLogin((prevState) => !prevState);
  const toggleVisibilityRegister = () =>
    setIsVisibleRegister((prevState) => !prevState);

  const loginForm = useForm<LoginUserType>({
    resolver: zodResolver(loginUserSchema),
    defaultValues: {
      emailOrUsername: "viet@gmail.com",
      password: "123Aa@",
    },
  });

  const registerForm = useForm<RegisterType>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      email: "",
      password: "",
    },
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
      await login(data.emailOrUsername, data.password);

      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Không tìm thấy accessToken");

      const payload = parseJwt(token);
      if (!payload?.role) throw new Error("Token không hợp lệ");

      const role = payload.role;

      const roleRoutes: Record<string, string> = {
        Supervisor: "/supervisors/topics/all",
        Administrator: "/admins/dashboard/overview",
        Moderator: "/moderators/dashboard",
        Reviewer: "/reviewers/dashboard/assigned-count",
      };

      navigate(roleRoutes[role] || "/");
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitRegister = async (data: RegisterType) => {
    setIsLoading(true);
    try {
      console.log("register", JSON.stringify(data, null, 2));
    } catch (error) {
      console.error("Register error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  console.log(JSON.stringify(user, null, 2));

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Tabs defaultValue="login" className="w-[400px] space-y-4">
        <TabsList className="grid h-10 w-full grid-cols-2">
          <TabsTrigger
            disabled={isLoading}
            value="login"
            className="hover:cursor-pointer"
          >
            Login
          </TabsTrigger>
          <TabsTrigger
            disabled={isLoading}
            value="register"
            className="hover:cursor-pointer"
          >
            Register
          </TabsTrigger>
        </TabsList>

        <TabsContent value="login">
          <form onSubmit={handleLoginSubmit(onSubmitLogin)}>
            <Card>
              <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>
                  Access your account securely by entering your email and
                  password.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="ml-1">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email or user name"
                      {...loginRegister("emailOrUsername")}
                    />
                  </div>
                  {loginErrors.emailOrUsername && (
                    <p className="mt-1 ml-1 text-sm text-red-600">
                      {loginErrors.emailOrUsername.message}
                    </p>
                  )}
                </div>

                <div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={isVisibleLogin ? "text" : "password"}
                        placeholder="Enter your password"
                        {...loginRegister("password")}
                      />
                      <button
                        className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 cursor-pointer items-center justify-center rounded-e-md transition-all duration-300 outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                        type="button"
                        onClick={toggleVisibilityLogin}
                        aria-label={
                          isVisibleLogin ? "Hide password" : "Show password"
                        }
                        aria-pressed={isVisibleLogin}
                        aria-controls="password"
                      >
                        {isVisibleLogin ? (
                          <EyeOff size={16} aria-hidden="true" />
                        ) : (
                          <Eye size={16} aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  </div>
                  {loginErrors.password && (
                    <p className="mt-1 ml-1 text-sm text-red-600">
                      {loginErrors.password.message}
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex w-full justify-end">
                <Button
                  type="submit"
                  disabled={isLoading}
                  size="lg"
                  className="mt-2 w-full hover:cursor-pointer"
                >
                  {isLoading ? "Loading..." : "Login"}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>

        <TabsContent value="register">
          <form onSubmit={handleRegisterSubmit(onSubmitRegister)}>
            <Card>
              <CardHeader>
                <CardTitle>Register</CardTitle>
                <CardDescription>
                  Create a new account to get started with our platform.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      {...registerRegister("fullName")}
                      placeholder="Enter your full name"
                    />
                    {registerErrors.fullName && (
                      <p className="mt-1 text-sm text-red-600">
                        {registerErrors.fullName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      {...registerRegister("phoneNumber")}
                      placeholder="Enter your phone number"
                    />
                    {registerErrors.phoneNumber && (
                      <p className="mt-1 text-sm text-red-600">
                        {registerErrors.phoneNumber.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      {...registerRegister("email")}
                      placeholder="Enter your email"
                    />
                    {registerErrors.email && (
                      <p className="mt-1 text-sm text-red-600">
                        {registerErrors.email.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>

                    <div className="relative">
                      <Input
                        id="password"
                        type={isVisibleRegister ? "text" : "password"}
                        placeholder="Enter your password"
                        {...registerRegister("password")}
                      />
                      <button
                        className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 cursor-pointer items-center justify-center rounded-e-md transition-all duration-300 outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                        type="button"
                        onClick={toggleVisibilityRegister}
                        aria-label={
                          isVisibleRegister ? "Hide password" : "Show password"
                        }
                        aria-pressed={isVisibleRegister}
                        aria-controls="password"
                      >
                        {isVisibleRegister ? (
                          <EyeOff size={16} aria-hidden="true" />
                        ) : (
                          <Eye size={16} aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  </div>
                  {registerErrors.password && (
                    <p className="mt-1 text-sm text-red-600">
                      {registerErrors.password.message}
                    </p>
                  )}
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="mt-2 w-full hover:cursor-pointer"
                >
                  {isLoading ? "Loading..." : "Register"}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default LoginPage;
