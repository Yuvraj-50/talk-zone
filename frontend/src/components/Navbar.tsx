import axios from "axios";
import { useAuthStore } from "../zustand/authStore";
import useWebSocketStore from "../zustand/socketStore";
import { Button } from "./ui/button";
import { Avatar } from "@radix-ui/react-avatar";
import { AvatarFallback, AvatarImage } from "./ui/avatar";
import { ModeToggle } from "./toggle-mode";

function Navbar() {
  const { UserId, Username } = useAuthStore();
  const { disconnect } = useWebSocketStore();

  async function handleLogout() {
    const response = await axios.get(
      "http://localhost:9000/api/v1/auth/logout",
      {
        withCredentials: true,
      }
    );
    disconnect();
    console.log(response);
  }

  return (
    <div className="flex items-center justify-between px-6 py-3">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-medium">{Username}</h1>
        <span className="text-sm">ID: {UserId}</span>
      </div>
      <Avatar>
        <AvatarImage src="" alt="@shadcn" />
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
