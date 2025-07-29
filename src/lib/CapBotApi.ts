import axios from "axios";

const apiUrl =
  import.meta.env.VITE_REACT_PUBLIC_API_URL || "http://localhost:5207";
const apiVersion = import.meta.env.VITE_REACT_PUBLIC_API_VERSION || "api";

const capBotAPI = axios.create({
  baseURL: `${apiUrl}/${apiVersion}`,
  timeout: 3000,
  headers: {
    "Content-Type": "application/json",
  },
});

capBotAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export default capBotAPI;
