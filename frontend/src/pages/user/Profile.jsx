import {
  CalendarDays,
  LogOut,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  authService,
} from "../../services/authService";

import {
  useAuth,
} from "../../hooks/useAuth";

export default function Profile() {
  const navigate =
    useNavigate();

  const {
    logout,
  } = useAuth();

  const [
    profile,
    setProfile,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    let active = true;

    authService
      .getProfile()
      .then((response) => {
        if (!active) {
          return;
        }

        setProfile(
          response.data
            ?.user || null
        );
      })
      .catch(
        (requestError) => {
          if (active) {
            setError(
              requestError.message ||
                "Unable to load profile."
            );
          }
        }
      )
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const signOut = () => {
    logout();

    navigate(
      "/login",
      {
        replace: true,
      }
    );
  };

  const initials =
    profile?.name
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
    <main className="page-container profile-page">
      <header className="profile-page-header">
        <div>
          <span className="section-label">
            ACCOUNT
          </span>

          <h1>
            Profile
          </h1>

          <p>
            Review your AI FitTrack
            account and authentication
            information.
          </p>
        </div>

        <button
          type="button"
          className="profile-signout-button"
          onClick={
            signOut
          }
        >
          <LogOut
            size={14}
          />

          Sign Out
        </button>
      </header>

      {error && (
        <div className="page-error">
          {error}
        </div>
      )}

      {loading ? (
        <section className="profile-loading">
          <div className="ai-loader">
            ✦
          </div>

          <strong>
            Loading your profile...
          </strong>
        </section>
      ) : profile ? (
        <div className="profile-layout">
          <section className="profile-identity-card">
            <div className="profile-avatar-large">
              {initials}
            </div>

            <h2>
              {profile.name}
            </h2>

            <p>
              {profile.email}
            </p>

            <span
              className={`profile-role-badge ${
                profile.role ===
                "admin"
                  ? "admin"
                  : ""
              }`}
            >
              {profile.role ===
              "admin"
                ? "Administrator"
                : "User"}
            </span>

            <div className="profile-security-note">
              <ShieldCheck
                size={15}
              />

              <div>
                <strong>
                  Protected Account
                </strong>

                <span>
                  Access is secured
                  through authenticated
                  AI FitTrack sessions.
                </span>
              </div>
            </div>
          </section>

          <section className="profile-details-card">
            <header>
              <span className="section-label">
                ACCOUNT INFORMATION
              </span>

              <h2>
                Profile Details
              </h2>

              <p>
                Information associated
                with your AI FitTrack
                account.
              </p>
            </header>

            <div className="profile-details-grid">
              <ProfileField
                icon={
                  <UserRound
                    size={17}
                  />
                }
                label="Full Name"
                value={
                  profile.name
                }
              />

              <ProfileField
                icon={
                  <Mail
                    size={17}
                  />
                }
                label="Email Address"
                value={
                  profile.email
                }
              />

              <ProfileField
                icon={
                  <ShieldCheck
                    size={17}
                  />
                }
                label="Account Role"
                value={
                  profile.role ===
                  "admin"
                    ? "Administrator"
                    : "User"
                }
              />

              <ProfileField
                icon={
                  <CalendarDays
                    size={17}
                  />
                }
                label="Member Since"
                value={
                  profile.createdAt
                    ? new Date(
                        profile.createdAt
                      ).toLocaleDateString(
                        undefined,
                        {
                          year:
                            "numeric",
                          month:
                            "long",
                          day:
                            "numeric",
                        }
                      )
                    : "—"
                }
              />
            </div>

            <footer className="profile-details-footer">
              <ShieldCheck
                size={13}
              />

              Profile modification is
              not enabled because the
              current backend contract
              provides profile retrieval
              only.
            </footer>
          </section>
        </div>
      ) : (
        <section className="profile-loading">
          <UserRound
            size={25}
          />

          <strong>
            Profile unavailable
          </strong>
        </section>
      )}
    </main>
  );
}

function ProfileField({
  icon,
  label,
  value,
}) {
  return (
    <article className="profile-field">
      <div className="profile-field-icon">
        {icon}
      </div>

      <div>
        <span>
          {label}
        </span>

        <strong>
          {value}
        </strong>
      </div>
    </article>
  );
}