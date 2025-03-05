import axios from "axios";
import React, { FormEvent, useEffect, useState } from "react";
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
import { Textarea } from "./ui/textarea";
import GoogleSignUp from "./GoogleSignUp";
import { HoverCard, HoverCardTrigger } from "./ui/hover-card";
import { HoverCardContent } from "@radix-ui/react-hover-card";
import { AuthResponse } from "@/types";
import Loader from "./ui/loader";
import { signup } from "@/api/auth";

interface FormStateType {
  email: string;
  password: string;
  name: string;
  bio: string;
}

const initialState = {
  email: "",
  password: "",
  name: "",
  bio: "Typing... probably something unnecessary. 🤪",
};

function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [formState, setFormState] = useState<FormStateType>(initialState);

  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const { setUser, setAuthenticated, authenticated, loading, setLoading } =
    useAuthStore();

  function handleStateUpdate(
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) {
    const key = e.target.id;
    if (key == "photo" && e.target instanceof HTMLInputElement) {
      const file = e.target.files?.[0];
      if (file) {
        setImage(file);
      }
    }

    setFormState((prev) => {
      return { ...prev, [key]: e.target.value };
    });
  }

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    if (
      !formState.email.trim() ||
      !formState.password.trim() ||
      !formState.name.trim() ||
      !formState.bio.trim()
    ) {
      return;
    }

    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append("email", formState.email);
      formData.append("password", formState.password);
      formData.append("name", formState.name);
      formData.append("bio", formState.bio);
      if (image) {
        formData.append("photo", image);
      }
      const data = await signup(formData);
      setFormState(initialState);
      const { user } = data;
      if (user) {
        setUser(user);
        setAuthenticated(true);
      }

      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      setError(error.response.data.message);
      setFormState(initialState);
    }
  }

  useEffect(() => {
    if (authenticated) {
      navigate("/");
    }
  }, [authenticated, navigate]);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        {error && (
          <div className="p-3 text-sm bg-red-100 border border-red-300 text-red-600 rounded-md">
            {error}
          </div>
        )}
        <CardHeader>
          <CardTitle className="text-2xl">Create new Account</CardTitle>
          <CardDescription>
            Enter your details below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="yuvaraj"
                  required
                  value={formState.name}
                  onChange={handleStateUpdate}
                />
              </div>
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
                  <p className="ml-auto inline-block text-sm underline-offset-4 hover:underline">
                    Forgot your password?
                  </p>
                </div>
                <Input
                  value={formState.password}
                  onChange={handleStateUpdate}
                  id="password"
                  type="password"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="photo">Upload Profile Photo</Label>
                <Input
                  onChange={handleStateUpdate}
                  id="photo"
                  required
                  type="file"
                  accept="image/*"
                />

                {image && (
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Button variant="link" onClick={() => {}}>
                        Hover to Preview Image
                      </Button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-44 h-36 z-30">
                      <img
                        src={URL.createObjectURL(image)}
                        alt="user profile image"
                      />
                    </HoverCardContent>
                  </HoverCard>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bio">Bio (optional)</Label>
                <Textarea
                  id="bio"
                  required
                  value={formState.bio}
                  onChange={handleStateUpdate}
                />
              </div>
              {loading ? (
                <Button disabled={true} className="w-full">
                  <Loader variant="secondary" size="sm" />
                </Button>
              ) : (
                <Button type="submit" className="w-full">
                  Signup
                </Button>
              )}

              <GoogleSignUp />
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?
              <Link to="/login" className="underline underline-offset-4">
                Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default SignUpForm;
