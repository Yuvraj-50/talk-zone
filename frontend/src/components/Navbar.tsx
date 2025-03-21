import { useAuthStore } from "../zustand/authStore";
import { Button } from "./ui/button";
import { Avatar } from "@radix-ui/react-avatar";
import { AvatarFallback, AvatarImage } from "./ui/avatar";
import { ModeToggle } from "./toggle-mode";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import Loader from "./ui/loader";
import { resetAllStores } from "@/lib/utils";
import { logout } from "@/api/auth";

function Navbar() {
  const { user, authenticated, loading, setLoading } = useAuthStore();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      setLoading(true);
      await logout();
      resetAllStores();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    navigate("/login", { replace: true });
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
      {loading ? (
        <Button size={"default"}>
          <Loader variant="secondary" size="sm" />
        </Button>
      ) : (
        <Button variant="default" size={"default"} onClick={handleLogout}>
          Logout
        </Button>
      )}
    </div>
  );
}

export default Navbar;
