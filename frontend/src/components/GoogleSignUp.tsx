import { AuthResponse } from "@/types";
import { useAuthStore } from "@/zustand/authStore";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

function GoogleSignUp() {
  const [loading, setLoading] = useState(false);
  const { authenticated, updateAuth } = useAuthStore();
  const navigate = useNavigate();

  async function handleGoogleSignUp(credentialResponse: CredentialResponse) {
    try {
      setLoading(true);
      const response = await axios.post<AuthResponse>(
        "http://localhost:9000/api/v1/auth/googleLogin",
        {
          token: credentialResponse.credential,
        },
        {
          withCredentials: true,
        }
      );

      const { user } = response.data;

      if (user) {
        updateAuth({
          user: user,
          authenticated: true,
        });
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log("error", "google login", error);
    }
  }

  useEffect(() => {
    if (authenticated) {
      navigate("/");
    }
  }, [authenticated]);

  return (
    <>
      <GoogleLogin
        onSuccess={handleGoogleSignUp}
        onError={() => {
          console.log("Login Failed");
        }}
      />
      {loading && <div className="flex justify-center"> loading ... </div>}
    </>
  );
}

export default GoogleSignUp;
