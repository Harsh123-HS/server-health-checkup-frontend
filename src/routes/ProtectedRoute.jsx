import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const [isAuth, setIsAuth] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setIsAuth(false);
      return;
    }

    // Optional: basic JWT expiry check
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const isExpired = payload.exp * 1000 < Date.now();

      if (isExpired) {
        localStorage.removeItem("token");
        setIsAuth(false);
      } else {
        setIsAuth(true);
      }
    } catch {
      setIsAuth(false);
    }
  }, []);

  if (isAuth === null) return null; // loading state
  if (!isAuth) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;
