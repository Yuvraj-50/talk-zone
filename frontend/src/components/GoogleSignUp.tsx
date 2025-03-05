import { googleLogin } from "@/api/auth";
import { useAuthStore } from "@/zustand/authStore";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

function GoogleSignUp() {
  const { authenticated, setLoading, setUser, setAuthenticated } =
    useAuthStore();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  async function handleGoogleSignUp(credentialResponse: CredentialResponse) {
    try {
      if (!credentialResponse.credential) {
        setError("something Went wrong Try agin");
        return;
      }
      setLoading(true);
      const data = await googleLogin(credentialResponse.credential);
      const { user } = data;
      setUser(user);
      setAuthenticated(true);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError("Google login failed");
      console.log(error);
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
      {error && <p>{error + " try again later"}</p>}
    </>
  );
}

export default GoogleSignUp;
