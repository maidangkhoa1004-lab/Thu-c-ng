import { Navigate } from "react-router-dom";
import { getCurrentUser } from "./auth";

function RequireAdmin({ children }) {
  const user = getCurrentUser();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role !== "admin") {
    return <Navigate to="/home" replace />;
  }
  return children;
}

export default RequireAdmin;
