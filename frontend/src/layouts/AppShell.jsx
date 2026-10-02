import {
  Outlet,
  useLocation,
} from "react-router-dom";

import AppTopNav from "../components/AppTopNav";
import FloatingChatbot from "../components/FloatingChatbot";

export default function AppShell() {
  const location =
    useLocation();

  return (
    <div className="application-shell">
      <AppTopNav />

      <Outlet />

      <FloatingChatbot
        key={`${location.pathname}${location.search}`}
      />
    </div>
  );
}