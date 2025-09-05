// src/contexts/AuthContext.tsx
import capBotAPI from "@/lib/CapBotApi";
import { createContext, useContext, useEffect, useState } from "react";
import type { Role } from "@/schemas/userSchema";

export interface IAuthResponseData {
  statusCode: number;
  success: boolean;
  data: {
    tokenData: {
      accessToken: string;
      refreshToken: string;
      expiryTime: string;
    };
  };
  errors: string;
  message: string;
}

export interface IUserData {
  unique_name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: IUserData | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (
    emailOrUsername: string,
    password: string,
    role: Role,
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const base64UrlDecode = (str: string) => {
  let s = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = s.length % 4;
  if (pad) s += "=".repeat(4 - pad);
  const decoded = atob(s);
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

export const parseJwt = (token: string): IUserData | null => {
  try {
    const payloadStr = base64UrlDecode(token.split(".")[1] || "");
    const payload = JSON.parse(payloadStr);
    const role =
      payload.role ||
      payload.Role ||
      (Array.isArray(payload.roles) ? payload.roles[0] : "");
    return {
      unique_name: payload.unique_name || payload.name || "",
      email: payload.email || payload.Email || "",
      role,
    };
  } catch {
    return null;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<IUserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async (
    emailOrUsername: string,
    password: string,
    role: Role,
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await capBotAPI.post<IAuthResponseData>("/auth/login", {
        emailOrUsername,
        password,
        role,
      });
      const { accessToken, expiryTime } = response.data.data.tokenData;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("expiryTime", expiryTime);
      const decoded = parseJwt(accessToken);
      if (decoded) {
        setUser(decoded);
        setIsAuthenticated(true);
      } else {
        throw new Error("Token không hợp lệ");
      }
    } catch {
      setError("Đăng nhập thất bại");
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("expiryTime");
    setUser(null);
    setIsAuthenticated(false);
  };

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    const expiryTime = localStorage.getItem("expiryTime");
    let timer: number | undefined;
    if (accessToken && expiryTime) {
      const now = new Date();
      const expiryDate = new Date(expiryTime);
      if (now < expiryDate) {
        const decoded = parseJwt(accessToken);
        if (decoded) {
          setUser(decoded);
          setIsAuthenticated(true);
          const timeout = expiryDate.getTime() - now.getTime();
          timer = window.setTimeout(logout, timeout);
        } else {
          logout();
        }
      } else {
        logout();
      }
    }
    setLoading(false);
    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, loading, error, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
