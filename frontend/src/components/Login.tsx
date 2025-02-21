import axios from "axios";
import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";

type FormStateType = {
  email: string;
  password: string;
};

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useAuthStore } from "@/zustand/authStore";
import GoogleSignUp from "./GoogleSignUp";
import { AuthResponse } from "@/types";

function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [formState, setFormState] = useState<FormStateType>({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { updateAuth, authenticated } = useAuthStore();

  function handleStateUpdate(e: React.ChangeEvent<HTMLInputElement>) {
    const key = e.target.type;
    setFormState((prev) => {
      return { ...prev, [key]: e.target.value };
    });
  }

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!formState.email || !formState.password) {
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post<AuthResponse>(
        "http://localhost:9000/api/v1/auth/login",
        {
          email: formState.email,
          password: formState.password,
        },
        { withCredentials: true }
      );

      setFormState({ email: "", password: "" });

      const { user } = response.data;

      if (user) {
        updateAuth({
          user,
          authenticated: true,
        });
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log("Invalid userName or password");
    }
  }

  useEffect(() => {
    if (authenticated) {
      navigate("/");
    }
  }, [authenticated]);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={formState.email}
                  onChange={handleStateUpdate}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  value={formState.password}
                  onChange={handleStateUpdate}
                  id="password"
                  type="password"
                  required
                />
              </div>
              {loading ? (
                <Button disabled={true} className="w-full">
                  loading..
                </Button>
              ) : (
                <Button type="submit" className="w-full">
                  Login
                </Button>
              )}

              <GoogleSignUp />
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?
              <Link to="/signup" className="underline underline-offset-4">
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default LoginForm;
