import axios from "axios";

const baseURL = import.meta.env.VITE_BACKEND_URL;

const axiosAuth = axios.create({
  baseURL: `${baseURL}/v1/auth`,
  withCredentials: true,
});

export default axiosAuth;
