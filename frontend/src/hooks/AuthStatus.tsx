import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "../zustand/authStore";
import { AuthResponse } from "@/types";

export const useAuth = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const {  authenticated, setUser, setAuthenticated } =
    useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get<AuthResponse>(
          "http://localhost:9000/api/v1/auth/status",
          {
            withCredentials: true,
          }
        );

        const { user } = response.data;

        if (user) {
          setUser(user);
          setAuthenticated(true);
        }
      } catch (err) {
        setUser(null);
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [setUser, setAuthenticated]);

  useEffect(() => {
    if (
      authenticated == true &&
      (window.location.pathname == "/login" ||
        window.location.pathname == "/signup")
    ) {
      navigate("/");
    }
  }, [navigate]);

  return { loading, authenticated };
};
