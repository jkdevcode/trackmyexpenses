import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers['token'] = token;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosClient;
