import axios from "axios";
import { useAuthStore } from "../zustand/authStore";
import useWebSocketStore from "../zustand/socketStore";

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
    <div className="flex items-center justify-between px-6 py-3 bg-[#1A1A1A] border-b border-gray-800">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-medium text-white">{Username}</h1>
        <span className="text-sm text-gray-400">ID: {UserId}</span>
      </div>
      <button
        onClick={handleLogout}
        className="px-4 py-2 text-sm font-medium text-gray-200 transition-colors rounded-lg bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600"
      >
        Logout
      </button>
    </div>
  );
}

export default Navbar;
