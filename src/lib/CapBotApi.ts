import axios, { AxiosHeaders, InternalAxiosRequestConfig } from "axios";

const apiUrl = (
  import.meta.env.VITE_REACT_PUBLIC_API_URL || "http://localhost:5207"
).replace(/\/+$/, "");
const apiVersion = (
  import.meta.env.VITE_REACT_PUBLIC_API_VERSION || "api"
).replace(/^\/+|\/+$/g, "");

const capBotAPI = axios.create({
  baseURL: `${apiUrl}/${apiVersion}`,
  timeout: 30000,
});

capBotAPI.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const headers = (config.headers ||= new AxiosHeaders());

    const token = localStorage.getItem("accessToken");
    if (token) headers.set("Authorization", `Bearer ${token}`);

    if (config.data instanceof FormData) {
      headers.delete("Content-Type");
    } else {
      if (!headers.has("Content-Type"))
        headers.set("Content-Type", "application/json");
    }

    return config;
  },
  (error) => Promise.reject(error),
);

export default capBotAPI;
