import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "../zustand/authStore";

interface User {
  userId: number;
  email: string;
  name: string;
}

interface AuthResponse {
  authenticated: boolean;
  user: User | null;
}

export const useAuth = () => {
  const [auth, setAuth] = useState<{
    authenticated: boolean;
    user: User | null;
  }>({
    authenticated: false,
    user: null,
  });

  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { updateAuth } = useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get<AuthResponse>(
          "http://localhost:9000/api/v1/auth/status",
          {
            withCredentials: true,
          }
        );

        const { authenticated, user } = response.data;

        setAuth({ authenticated, user });

        console.log(user, "hello world");

        if (user) {
          updateAuth({
            userName: user.name,
            email: user.email,
            userId: user.userId,
          });
        }
      } catch (err) {
        setAuth({ authenticated: false, user: null });
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (
      auth.authenticated == true &&
      (window.location.pathname == "/login" ||
        window.location.pathname == "/signup")
    ) {
      navigate("/");
    }
  }, [auth, navigate]);

  return { ...auth, loading };
};
