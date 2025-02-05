import axios from "axios";
import { useAuthStore } from "../zustand/authStore";

function Navbar() {
  const { userName, userId, email } = useAuthStore();

  async function handleLogout() {
    const response = await axios.get(
      "http://localhost:9000/api/v1/auth/logout",
      {
        withCredentials: true,
      }
    );

    console.log(response);
  }
  return (
    <div className="flex justify-between p-3 bg-purple-400">
      <div className="flex gap-2">
        <h1>{userName}</h1>
        <h1>{userId}</h1>
        <h1>{email}</h1>
      </div>
      <button className="border border-green-300" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

export default Navbar;
