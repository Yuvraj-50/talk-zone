import { baseURL } from "@/lib/constant";
import axios from "axios";

const axiosChat = axios.create({
  baseURL: `${baseURL}/v1/chat`,
  withCredentials: true,
});

export default axiosChat;
