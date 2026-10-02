import {
  Navigate,
  Outlet,
} from "react-router-dom";

import {
  useAuth,
} from "../../hooks/useAuth";


export default function ProtectedRoute() {
  const {
    initializing,
    isAuthenticated,
  } = useAuth();


  if (initializing) {
    return (
      <div className="app-loading-screen">
        <div className="app-spinner" />

        <p>
          Restoring your session...
        </p>
      </div>
    );
  }


  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }


  return <Outlet />;
}