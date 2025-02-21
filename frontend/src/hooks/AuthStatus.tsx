import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "../zustand/authStore";
import { AuthResponse } from "@/types";

export const useAuth = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { updateAuth, authenticated } = useAuthStore();

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

        console.log(user, "hooks");

        if (user) {
          updateAuth({
            user,
            authenticated: true,
          });
        }
      } catch (err) {
        updateAuth({
          user: null,
          authenticated: false,
        });
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [updateAuth]);

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
