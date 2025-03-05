import axiosAuth from "./axiosAuth";
import { AuthResponse, UpdateProfileAndBio, User } from "@/types";

interface UserApiResponse {
  users: User[];
}

export const login = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  try {
    const response = await axiosAuth.post<AuthResponse>("/login", {
      email,
      password,
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "An unexpected error occurred";
  }
};
export const googleLogin = async (token: string): Promise<AuthResponse> => {
  try {
    const response = await axiosAuth.post<AuthResponse>("/googleLogin", {
      token,
    });
    return response.data;
  } catch (error: any) {
    console.log(error);
    throw error.response?.data?.message || "Google login failed";
  }
};

export const logout = async (): Promise<any> => {
  try {
    return await axiosAuth.get("/logout");
  } catch (error: any) {
    throw error.response?.data?.message || "Logout failed";
  }
};

export const signup = async (formData: FormData): Promise<AuthResponse> => {
  try {
    const response = await axiosAuth.post<AuthResponse>("/signup", formData);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Signup failed";
  }
};

export const getUsers = async (search: string): Promise<UserApiResponse> => {
  try {
    const response = await axiosAuth.get<UserApiResponse>(
      `/getUsers/${search}`
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to fetch users";
  }
};

export const getAuthStatus = async (): Promise<AuthResponse> => {
  try {
    const response = await axiosAuth.get<AuthResponse>("/status");
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to fetch auth status";
  }
};

export const getUserProfiles = async (
  chatIds: number[]
): Promise<UpdateProfileAndBio[]> => {
  try {
    const response = await axiosAuth.post<{ users: UpdateProfileAndBio[] }>(
      "/userProfiles",
      { users: chatIds }
    );
    return response.data.users;
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to fetch user profiles";
  }
};
