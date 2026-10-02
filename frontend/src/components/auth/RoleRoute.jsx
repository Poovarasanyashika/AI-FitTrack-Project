import {
  Navigate,
  Outlet,
} from "react-router-dom";

import {
  useAuth,
} from "../../hooks/useAuth";


export default function RoleRoute({
  role,
}) {
  const {
    user,
  } = useAuth();


  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }


  if (
    user.role !== role
  ) {
    return (
      <Navigate
        to={
          user.role ===
          "admin"
            ? "/admin/dashboard"
            : "/dashboard"
        }
        replace
      />
    );
  }


  return <Outlet />;
}