import axios from "axios";
import { useAuthStore } from "../zustand/authStore";
import useWebSocketStore from "../zustand/socketStore";
import { Button } from "./ui/button";
import { Avatar } from "@radix-ui/react-avatar";
import { AvatarFallback, AvatarImage } from "./ui/avatar";
import { ModeToggle } from "./toggle-mode";
import { useEffect } from "react";
import { useNavigate } from "react-router";

function Navbar() {
  const { user, updateAuth, authenticated } = useAuthStore();
  const { disconnect } = useWebSocketStore();
  const navigate = useNavigate();

  async function handleLogout() {
    const response = await axios.get(
      "http://localhost:9000/api/v1/auth/logout",
      {
        withCredentials: true,
      }
    );

    if (response.status === 200) {
      updateAuth({
        authenticated: false,
        user: null,
      });
      disconnect();
    }
  }

  useEffect(() => {
    navigate("/login");
  }, [authenticated]);

  return (
    <div className="flex items-center justify-between px-6 py-3">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-medium">{user?.name}</h1>
        <span className="text-sm">ID: {user?.id}</span>
      </div>
      <Avatar>
        <AvatarImage
          className="w-10 h-10 rounded-full"
          src={user?.profileUrl}
          alt="user profile pic"
        />
        <AvatarFallback>Ys</AvatarFallback>
      </Avatar>
      <ModeToggle />
      <Button variant="default" onClick={handleLogout}>
        Logout
      </Button>
    </div>
  );
}

export default Navbar;
