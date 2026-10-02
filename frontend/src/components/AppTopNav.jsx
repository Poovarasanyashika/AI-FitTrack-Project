import {
  Activity,
  BarChart3,
  ChevronDown,
  Dumbbell,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  Search,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../hooks/useAuth";

const USER_LINKS = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    to: "/workout-search",
    label: "Search",
    icon: Search,
  },
  {
    to: "/workouts",
    label: "Workouts",
    icon: Dumbbell,
  },
  {
    to: "/ai-recommendation",
    label: "AI Recommendation",
    icon: Sparkles,
  },
  {
    to: "/fitness-insights",
    label: "Fitness Insights",
    icon: HeartPulse,
  },
];

const ADMIN_LINKS = [
  {
    tab: "overview",
    label: "Admin Dashboard",
    icon: LayoutDashboard,
  },
  {
    tab: "users",
    label: "Users",
    icon: Users,
  },
  {
    tab: "workouts",
    label: "Workouts",
    icon: Dumbbell,
  },
  {
    tab: "reports",
    label: "Reports & Analytics",
    icon: BarChart3,
  },
  {
    tab: "health",
    label: "System Health",
    icon: Activity,
  },
];

export default function AppTopNav() {
  const {
    user,
    logout,
  } = useAuth();

  const navigate =
    useNavigate();

  const location =
    useLocation();

  const profileRef =
    useRef(null);

  const [
    searchValue,
    setSearchValue,
  ] = useState("");

  const [
    profileOpen,
    setProfileOpen,
  ] = useState(false);

  const isAdmin =
    user?.role === "admin";

  const adminTab =
    new URLSearchParams(
      location.search
    ).get("tab") ||
    "overview";

  useEffect(() => {
    if (!profileOpen) {
      return undefined;
    }

    const closeMenu = (
      event
    ) => {
      if (
        !profileRef.current
          ?.contains(
            event.target
          )
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener(
      "pointerdown",
      closeMenu
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        closeMenu
      );
    };
  }, [profileOpen]);

  const submitSearch = (
    event
  ) => {
    event.preventDefault();

    const value =
      searchValue.trim();

    if (!value) {
      return;
    }

    navigate(
      `/workout-search?q=${encodeURIComponent(
        value
      )}`
    );

    setSearchValue("");
  };

  const signOut = () => {
    setProfileOpen(false);

    logout();

    navigate(
      "/login",
      {
        replace: true,
      }
    );
  };

  const initials =
    user?.name
      ?.split(" ")
      .filter(Boolean)
      .map(
        (part) =>
          part[0]
      )
      .join("")
      .slice(0, 2)
      .toUpperCase() ||
    "U";

  return (
    <header
      className={`role-navbar ${
        isAdmin
          ? "admin-mode"
          : "user-mode"
      }`}
    >
      <Link
        className="role-brand"
        to={
          isAdmin
            ? "/admin?tab=overview"
            : "/dashboard"
        }
      >
        <div className="role-brand-mark">
          <Activity
            size={21}
          />
        </div>

        <div>
          <strong>
            AI FitTrack
          </strong>

          <small>
            {isAdmin
              ? "POOVARASAN TEAM ADMIN"
              : "POOVARASAN TEAM EDITION"}
          </small>
        </div>
      </Link>

      {!isAdmin && (
        <form
          className="role-global-search"
          onSubmit={
            submitSearch
          }
        >
          <Search
            size={15}
          />

          <input
            value={
              searchValue
            }
            onChange={(
              event
            ) =>
              setSearchValue(
                event.target
                  .value
              )
            }
            placeholder="Search workout plans..."
          />

          <button
            type="submit"
          >
            Search
          </button>
        </form>
      )}

      <nav className="role-nav-links">
        {isAdmin
          ? ADMIN_LINKS.map(
              ({
                tab,
                label,
                icon: Icon,
              }) => (
                <Link
                  key={tab}
                  to={`/admin?tab=${tab}`}
                  className={`role-nav-link ${
                    location.pathname ===
                      "/admin" &&
                    adminTab ===
                      tab
                      ? "active"
                      : ""
                  }`}
                >
                  <Icon
                    size={15}
                  />

                  <span>
                    {label}
                  </span>
                </Link>
              )
            )
          : USER_LINKS.map(
              ({
                to,
                label,
                icon: Icon,
              }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({
                    isActive,
                  }) =>
                    `role-nav-link ${
                      isActive
                        ? "active"
                        : ""
                    }`
                  }
                >
                  <Icon
                    size={15}
                  />

                  <span>
                    {label}
                  </span>
                </NavLink>
              )
            )}
      </nav>

      <div
        className="role-profile"
        ref={profileRef}
      >
        <button
          type="button"
          className="role-profile-button"
          onClick={() =>
            setProfileOpen(
              (current) =>
                !current
            )
          }
        >
          <span className="role-avatar">
            {initials}
          </span>

          <span className="role-profile-copy">
            <strong>
              {user?.name ||
                "User"}
            </strong>

            <small>
              {isAdmin
                ? "Admin"
                : "User"}
            </small>
          </span>

          <ChevronDown
            size={14}
          />
        </button>

        {profileOpen && (
          <div className="role-profile-menu">
            <Link
              to="/profile"
              onClick={() =>
                setProfileOpen(
                  false
                )
              }
            >
              <UserRound
                size={15}
              />

              Profile
            </Link>

            <button
              type="button"
              onClick={
                signOut
              }
            >
              <LogOut
                size={15}
              />

              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
