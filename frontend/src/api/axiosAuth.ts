import { baseURL } from "@/lib/constant";
import axios from "axios";

const axiosAuth = axios.create({
  baseURL: `${baseURL}/v1/auth`,
  withCredentials: true,
});

export default axiosAuth;
