import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "../zustand/authStore";
import { AuthResponse } from "../types";

export const useAuth = () => {
  // const [auth, setAuth] = useState<AuthResponse>({
  //   authenticated: false,
  //   user: null,
  // });

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

        const { authenticated, user } = response.data;

        if (authenticated && user) {
          updateAuth({
            Username: user.name,
            UserEmail: user.email,
            UserId: user.id,
            authenticated: authenticated,
          });
        }
      } catch (err) {
        // setAuth({ authenticated: false, user: null });
        console.log(err);
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
