import { Navigate, Outlet, Route } from "react-router-dom";
import { useAuth } from "../hooks/AuthStatus";
import { Routes } from "react-router";
import ChatDashboard from "../components/ChatDashboard";
import LoginPage from "@/pages/Login";
import SignUpPage from "@/pages/Signup";
import Loader from "@/components/ui/loader";

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
    return <Loader fullScreen variant="primary" size="lg" />;
  }

  return (
    <Routes>
      <Route element={<PublicRoutes authenticated={authenticated} />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
      </Route>

      <Route element={<ProtectedRoute authenticated={authenticated} />}>
        <Route path="/" element={<ChatDashboard />} />
      </Route>
    </Routes>
  );
};
