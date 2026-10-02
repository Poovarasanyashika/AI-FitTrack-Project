import {
  useAuth,
} from "../../hooks/useAuth";


export default function AdminDashboard() {
  const {
    user,
    logout,
  } = useAuth();


  return (
    <main className="foundation-page">
      <section className="foundation-card">
        <span className="foundation-badge admin">
          ADMIN
        </span>

        <h1>
          AI FitTrack Admin Dashboard
        </h1>

        <p>
          Welcome, {user?.name}.
        </p>

        <p>
          {user?.email}
        </p>

        <button
          type="button"
          onClick={logout}
        >
          Logout
        </button>
      </section>
    </main>
  );
}