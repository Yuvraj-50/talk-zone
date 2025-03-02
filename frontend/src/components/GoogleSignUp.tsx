import { AuthResponse } from "@/types";
import { useAuthStore } from "@/zustand/authStore";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

function GoogleSignUp() {
  const { authenticated, setLoading, setUser, setAuthenticated } =
    useAuthStore();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

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
        setUser(user);
        setAuthenticated(true);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError("Google login failed");
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
        shape="circle"
        theme="filled_black"
        type="standard"
        text="continue_with"
        onSuccess={handleGoogleSignUp}
        onError={() => {
          setError("Google login failed");
          setLoading(false);
        }}
      />
      {error && <p>{error + "try again later"}</p>}
    </>
  );
}

export default GoogleSignUp;
