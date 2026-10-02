import {
  lazy,
  Suspense,
} from "react";

import {
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";

import {
  useAuth,
} from "./hooks/useAuth";

import AppShell from "./layouts/AppShell";
import Login from "./pages/auth/Login";


/* =====================================================
   ROUTE-LEVEL CODE SPLITTING
===================================================== */

const Dashboard =
  lazy(() =>
    import(
      "./pages/user/Dashboard"
    )
  );

const WorkoutSearch =
  lazy(() =>
    import(
      "./pages/user/WorkoutSearch"
    )
  );

const Workouts =
  lazy(() =>
    import(
      "./pages/user/Workouts"
    )
  );

const AIRecommendation =
  lazy(() =>
    import(
      "./pages/user/AIRecommendation"
    )
  );

const FitnessInsights =
  lazy(() =>
    import(
      "./pages/user/FitnessInsights"
    )
  );

const Profile =
  lazy(() =>
    import(
      "./pages/user/Profile"
    )
  );

const AdminConsole =
  lazy(() =>
    import(
      "./pages/admin/AdminConsole"
    )
  );


/* =====================================================
   AUTH GUARD
===================================================== */

function RequireAuth() {
  const {
    user,
    initializing,
  } = useAuth();

  if (initializing) {
    return (
      <FullScreenLoader
        text="Preparing your AI FitTrack workspace..."
      />
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return <Outlet />;
}


/* =====================================================
   ADMIN GUARD
===================================================== */

function RequireUser() {
  const {
    user,
  } = useAuth();

  if (
    user?.role === "admin"
  ) {
    return (
      <Navigate
        to="/admin?tab=overview"
        replace
      />
    );
  }

  return <Outlet />;
}

function RequireAdmin() {
  const {
    user,
  } = useAuth();

  if (
    user?.role !== "admin"
  ) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return <Outlet />;
}


/* =====================================================
   LAZY ROUTE LOADER
===================================================== */

function RouteLoader() {
  return (
    <FullScreenLoader
      text="Loading AI FitTrack..."
    />
  );
}

function FullScreenLoader({
  text,
}) {
  return (
    <div className="full-loader">
      <div className="ai-loader">
        ✦
      </div>

      <strong>
        {text}
      </strong>
    </div>
  );
}


/* =====================================================
   APPLICATION ROUTES
===================================================== */

export default function App() {
  return (
    <Suspense
      fallback={
        <RouteLoader />
      }
    >
      <Routes>
        <Route
          path="/login"
          element={
            <Login />
          }
        />

        <Route
          element={
            <RequireAuth />
          }
        >
          <Route
            element={
              <AppShell />
            }
          >
            <Route
              element={
                <RequireUser />
              }
            >
              <Route
                path="/dashboard"
                element={
                  <Dashboard />
                }
              />

              <Route
                path="/workout-search"
                element={
                  <WorkoutSearch />
                }
              />

              <Route
                path="/workouts"
                element={
                  <Workouts />
                }
              />

              <Route
                path="/ai-recommendation"
                element={
                  <AIRecommendation />
                }
              />

              <Route
                path="/fitness-insights"
                element={
                  <FitnessInsights />
                }
              />
            </Route>

            <Route
              path="/profile"
              element={
                <Profile />
              }
            />

            <Route
              element={
                <RequireAdmin />
              }
            >
              <Route
                path="/admin"
                element={
                  <AdminConsole />
                }
              />
            </Route>
          </Route>
        </Route>

        <Route
          path="/"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />
      </Routes>
    </Suspense>
  );
}

