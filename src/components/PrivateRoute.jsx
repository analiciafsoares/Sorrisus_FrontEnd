import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles?.length) {
    const role = Array.isArray(user.role)
      ? String(user.role[0] || "").toUpperCase()
      : String(user.role?.name || user.role || "").toUpperCase();
    const autorizado = allowedRoles
      .map((allowedRole) => String(allowedRole).toUpperCase())
      .includes(role);

    if (!autorizado) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default PrivateRoute;
