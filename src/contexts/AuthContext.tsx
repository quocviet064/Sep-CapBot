import capBotAPI from "@/lib/CapBotApi";
import { createContext, useContext, useEffect, useState } from "react";

export interface IAuthResponseData {
  statusCode: number;
  success: boolean;
  data: {
    tokenData: {
      accessToken: string;
      refreshToken: string;
      expiryTime: string; // ISO string
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
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const parseJwt = (token: string): IUserData | null => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return {
      unique_name: payload.unique_name,
      email: payload.email || payload.Email,
      role: payload.role,
    };
  } catch (e) {
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

  const login = async (emailOrUsername: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await capBotAPI.post<IAuthResponseData>("/auth/login", {
        emailOrUsername,
        password,
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
    } catch (err: any) {
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

    if (accessToken && expiryTime) {
      const now = new Date();
      const expiryDate = new Date(expiryTime);

      if (now < expiryDate) {
        const decoded = parseJwt(accessToken);
        if (decoded) {
          setUser(decoded);
          setIsAuthenticated(true);
          // Auto logout khi hết hạn token
          const timeout = expiryDate.getTime() - now.getTime();
          const timer = setTimeout(logout, timeout);
          return () => clearTimeout(timer);
        } else {
          logout();
        }
      } else {
        logout();
      }
    }

    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, loading, error, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook để sử dụng AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
