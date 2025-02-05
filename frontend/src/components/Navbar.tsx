import axios from "axios";
import { useAuthStore } from "../zustand/authStore";

function Navbar() {
  const {  UserId, Username } = useAuthStore();

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
        <h1>{Username}</h1>
        <h1>{UserId}</h1>
        <h1>{Username}</h1>
      </div>
      <button className="border border-green-300" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

export default Navbar;
