import axios from "axios";

const baseURL = import.meta.env.VITE_BACKEND_URL;

const axiosChat = axios.create({
  baseURL: `${baseURL}/v1/chat`,
  withCredentials: true,
});

export default axiosChat;
