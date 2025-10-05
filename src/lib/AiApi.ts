import axios, { AxiosHeaders, InternalAxiosRequestConfig } from "axios";

const aiBaseUrl =
  import.meta.env.VITE_AI_API_BASE_URL?.replace(/\/+$/, "") ?? "";

const aiAPI = axios.create({
  baseURL: aiBaseUrl,
  timeout: 30000,
});

aiAPI.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const headers = (config.headers ||= new AxiosHeaders());
    const token = localStorage.getItem("accessToken");
    if (token) headers.set("Authorization", `Bearer ${token}`);
    if (config.data instanceof FormData) headers.delete("Content-Type");
    else if (!headers.has("Content-Type"))
      headers.set("Content-Type", "application/json");
    return config;
  },
  (error) => Promise.reject(error),
);

export default aiAPI;
