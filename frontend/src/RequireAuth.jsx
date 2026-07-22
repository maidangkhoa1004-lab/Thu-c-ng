import { Navigate } from "react-router-dom";
import { getCurrentUser } from "./auth";

function RequireAuth({ children }) {
  const user = getCurrentUser();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default RequireAuth;
