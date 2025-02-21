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

interface FormStateType {
  email: string;
  password: string;
  name: string;
  bio: string;
}

function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [formState, setFormState] = useState<FormStateType>({
    email: "",
    password: "",
    name: "",
    bio: "Typing... probably something unnecessary. 🤪",
  });

  const [image, setImage] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { updateAuth, authenticated } = useAuthStore();

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

      const formData = new FormData();
      formData.append("email", formState.email);
      formData.append("password", formState.password);
      formData.append("name", formState.name);
      formData.append("bio", formState.bio);
      if (image) {
        formData.append("photo", image);
      }

      const response = await axios.post<AuthResponse>(
        "http://localhost:9000/api/v1/auth/signup",
        formData,
        { withCredentials: true }
      );

      setFormState({ email: "", password: "", name: "", bio: "" });

      const { user } = response.data;

      console.log(user);

      if (user) {
        updateAuth({
          user,
          authenticated: true,
        });
      }

      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log("Error in signup:", error);
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
                  Loading...
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
