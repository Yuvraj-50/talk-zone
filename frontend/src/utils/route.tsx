import { Navigate, Outlet, Route } from "react-router-dom";
import { useAuth } from "../hooks/AuthStatus";
import Login from "../components/Login";
import Signup from "../components/Signup";
import { Routes } from "react-router";
import ChatDashboard from "../components/ChatDashboard";

export const ProtectedRoute = ({
  authenticated,
}: {
  authenticated: boolean;
}) => {
  return authenticated ? <Outlet /> : <Navigate to="/login" />;
};

export const PublicRoutes = ({ authenticated }: { authenticated: boolean }) => {
  return authenticated ? <Navigate to="/" /> : <Outlet />;
};

export const MyRouter = () => {
  const { authenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading....</div>;
  }

  return (
    <Routes>
      <Route element={<PublicRoutes authenticated={authenticated} />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>

      <Route element={<ProtectedRoute authenticated={authenticated} />}>
        <Route path="/" element={<ChatDashboard />} />
      </Route>
    </Routes>
  );
};
