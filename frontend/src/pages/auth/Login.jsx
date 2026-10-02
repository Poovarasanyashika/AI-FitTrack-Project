import {
  Activity,
  ArrowRight,
  Dumbbell,
  ShieldCheck,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  Navigate,
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../../hooks/useAuth";

const DEMO_USER = {
  email:
    "demo.user@poovarasanfittrack.local",
  password:
    "PoovarasanDemo@12345",
};

const DEMO_ADMIN = {
  email:
    "demo.admin@poovarasanfittrack.local",
  password:
    "PoovarasanAdmin@12345",
};

const getHomeRoute = (
  account
) =>
  account?.role === "admin"
    ? "/admin?tab=overview"
    : "/dashboard";

export default function Login() {
  const navigate =
    useNavigate();

  const {
    user,
    initializing,
    login,
    register,
  } = useAuth();

  const [
    mode,
    setMode,
  ] = useState("login");

  const [
    form,
    setForm,
  ] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [
    status,
    setStatus,
  ] = useState({
    loading: false,
    error: "",
  });

  if (initializing) {
    return (
      <FullScreenLoader
        text="Preparing AI FitTrack — Poovarasan Team..."
      />
    );
  }

  if (user) {
    return (
      <Navigate
        to={
          getHomeRoute(user)
        }
        replace
      />
    );
  }

  const change = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setForm(
      (current) => ({
        ...current,
        [name]: value,
      })
    );
  };

  const completeLogin = (
    response
  ) => {
    navigate(
      getHomeRoute(
        response?.data?.user
      ),
      {
        replace: true,
      }
    );

    return response;
  };

  const submit = async (
    event
  ) => {
    event.preventDefault();

    setStatus({
      loading: true,
      error: "",
    });

    try {
      let response;

      if (
        mode === "register"
      ) {
        if (
          form.password !==
          form.confirmPassword
        ) {
          throw new Error(
            "Passwords do not match"
          );
        }

        response =
          await register({
            name:
              form.name.trim(),
            email:
              form.email.trim(),
            password:
              form.password,
          });
      } else {
        response =
          await login({
            email:
              form.email.trim(),
            password:
              form.password,
          });
      }

      completeLogin(
        response
      );
    } catch (error) {
      setStatus({
        loading: false,
        error:
          error.message ||
          "Authentication failed",
      });
    }
  };

  const demoLogin =
    async (account) => {
      setStatus({
        loading: true,
        error: "",
      });

      try {
        const response =
          await login(
            account
          );

        completeLogin(
          response
        );
      } catch (error) {
        setStatus({
          loading: false,
          error:
            error.message ||
            "Demo login failed",
        });
      }
    };

  return (
    <div className="login-page">
      <header className="public-navbar">
        <div className="app-brand">
          <div className="app-brand-icon">
            <Activity
              size={18}
            />
          </div>

          <div>
            <strong>
              AI FitTrack
            </strong>

            <small>
              POOVARASAN TEAM EDITION
            </small>
          </div>
        </div>

        <div className="public-search">
          Search workout plans...
        </div>

        <nav className="public-nav-links">
          <span>
            Dashboard
          </span>

          <span>
            Search
          </span>

          <span>
            Workouts
          </span>

          <span>
            AI Insights
          </span>
        </nav>

        <div className="public-actions">
          <button
            type="button"
            className="ghost-small-button"
            onClick={() =>
              setMode("login")
            }
          >
            Sign In
          </button>

          <button
            type="button"
            className="blue-small-button"
            onClick={() =>
              setMode(
                "register"
              )
            }
          >
            Get Started
          </button>
        </div>
      </header>

      <main className="login-content">
        <section className="login-card">
          <div className="login-logo">
            <Dumbbell
              size={23}
            />
          </div>

          <h1>
            {mode === "login"
              ? "Welcome Back"
              : "Create Account"}
          </h1>

          <p>
            {mode === "login"
              ? "Sign in to access your dashboard, workouts and AI fitness insights."
              : "Create your AI FitTrack account and start your fitness journey."}
          </p>

          {status.error && (
            <div className="error-message">
              {status.error}
            </div>
          )}

          <form
            className="login-form"
            onSubmit={submit}
          >
            {mode ===
              "register" && (
              <label>
                <span>
                  Full Name
                </span>

                <input
                  name="name"
                  value={
                    form.name
                  }
                  onChange={
                    change
                  }
                  placeholder="Enter your name"
                  required
                />
              </label>
            )}

            <label>
              <span>
                Email Address
              </span>

              <input
                type="email"
                name="email"
                value={
                  form.email
                }
                onChange={
                  change
                }
                placeholder="you@example.com"
                required
              />
            </label>

            <label>
              <span>
                Password
              </span>

              <input
                type="password"
                name="password"
                value={
                  form.password
                }
                onChange={
                  change
                }
                placeholder="Enter password"
                required
              />
            </label>

            {mode ===
              "register" && (
              <label>
                <span>
                  Confirm Password
                </span>

                <input
                  type="password"
                  name="confirmPassword"
                  value={
                    form.confirmPassword
                  }
                  onChange={
                    change
                  }
                  placeholder="Confirm password"
                  required
                />
              </label>
            )}

            <button
              type="submit"
              className="sign-in-button"
              disabled={
                status.loading
              }
            >
              <span>
                {status.loading
                  ? "Please wait..."
                  : mode ===
                      "login"
                    ? "Sign In"
                    : "Create Account"}
              </span>

              {!status.loading && (
                <ArrowRight
                  size={16}
                />
              )}
            </button>
          </form>

          <div className="demo-title">
            <span />
            INSTANT DEMO CREDENTIALS
            <span />
          </div>

          <div className="demo-login-row">
            <button
              type="button"
              disabled={
                status.loading
              }
              onClick={() =>
                demoLogin(
                  DEMO_USER
                )
              }
            >
              <Dumbbell
                size={16}
              />

              <div>
                <strong>
                  Demo User
                </strong>

                <small>
                  Fitness dashboard
                </small>
              </div>
            </button>

            <button
              type="button"
              disabled={
                status.loading
              }
              onClick={() =>
                demoLogin(
                  DEMO_ADMIN
                )
              }
            >
              <ShieldCheck
                size={16}
              />

              <div>
                <strong>
                  Demo Admin
                </strong>

                <small>
                  Admin access
                </small>
              </div>
            </button>
          </div>

          <div className="login-footer-link">
            {mode === "login"
              ? "Don't have an account?"
              : "Already have an account?"}

            <button
              type="button"
              onClick={() =>
                setMode(
                  mode === "login"
                    ? "register"
                    : "login"
                )
              }
            >
              {mode === "login"
                ? "Create one free"
                : "Sign in"}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

function FullScreenLoader({
  text,
}) {
  return (
    <div className="full-loader">
      <div className="ai-loader">
        âœ¦
      </div>

      <strong>
        {text}
      </strong>
    </div>
  );
}
