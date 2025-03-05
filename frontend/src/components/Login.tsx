import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
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
import Loader from "./ui/loader";
import { login } from "@/api/auth";

interface FormStateType {
  email: string;
  password: string;
}

const initialState = {
  email: "",
  password: "",
};

function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [formState, setFormState] = useState<FormStateType>(initialState);

  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { setUser, setAuthenticated, authenticated, loading, setLoading } =
    useAuthStore();

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
      const data = await login(formState.email, formState.password);
      setFormState(initialState);
      const { user } = data;
      setUser(user);
      setAuthenticated(true);
      setLoading(false);
    } catch (error: any) {
      setError(error);
      setLoading(false);
      console.log("Invalid userName or password");
    }
  }

  useEffect(() => {
    if (authenticated) {
      navigate("/", { replace: true });
    }
  }, [authenticated]);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        {error && (
          <div className="p-3 text-s border-destructive bg-destructive rounded-md">
            {error}
          </div>
        )}
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
                  <Loader variant="secondary" />
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
