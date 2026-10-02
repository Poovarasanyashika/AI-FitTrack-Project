import {
  Activity,
  Clock3,
  Dumbbell,
  Flame,
  Sparkles,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  workoutService,
} from "../../services/workoutService";

import {
  useAuth,
} from "../../hooks/useAuth";

export default function Dashboard() {
  const { user } = useAuth();

  const [workouts, setWorkouts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let active = true;

    workoutService
      .getWorkouts()
      .then((response) => {
        if (!active) {
          return;
        }

        setWorkouts(
          response.data?.workouts || []
        );
      })
      .catch((requestError) => {
        if (!active) {
          return;
        }

        setError(
          requestError.message
        );
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const metrics = useMemo(() => {
    const duration =
      workouts.reduce(
        (sum, workout) =>
          sum +
          Number(
            workout.duration || 0
          ),
        0
      );

    const calories =
      workouts.reduce(
        (sum, workout) =>
          sum +
          Number(
            workout.caloriesBurned || 0
          ),
        0
      );

    return {
      count: workouts.length,
      duration,
      calories,

      average:
        workouts.length > 0
          ? Math.round(
              duration /
                workouts.length
            )
          : 0,
    };
  }, [workouts]);

  const chartData =
    useMemo(() => {
      return [...workouts]
        .sort(
          (a, b) =>
            new Date(
              a.workoutDate
            ) -
            new Date(
              b.workoutDate
            )
        )
        .map((workout) => ({
          date:
            new Date(
              workout.workoutDate
            ).toLocaleDateString(
              undefined,
              {
                month: "short",
                day: "numeric",
              }
            ),

          duration:
            Number(
              workout.duration ||
                0
            ),

          calories:
            Number(
              workout.caloriesBurned ||
                0
            ),
        }));
    }, [workouts]);

  return (
    <main className="page-container">
      <div className="dashboard-kicker">
        {new Date().toLocaleDateString(
          undefined,
          {
            weekday: "long",
            month: "short",
            day: "numeric",
            year: "numeric",
          }
        )}

        <span>•</span>

        Fitness Dashboard
      </div>

      <header className="page-title-row">
        <div>
          <h1>
            Hello, {user?.name || "User"}
          </h1>

          <p>
            Track your workouts and improve
            with AI-powered fitness intelligence.
          </p>
        </div>

        <div className="live-status">
          <span />

          Fitness data live
        </div>
      </header>

      {error && (
        <div className="page-error">
          {error}
        </div>
      )}

      <section className="fitness-overview-card">
        <div className="overview-primary">
          <div className="section-label">
            MY FITNESS OVERVIEW
          </div>

          <div className="overview-icon">
            <Dumbbell size={25} />
          </div>

          <strong className="overview-main-value">
            {loading
              ? "—"
              : metrics.count}
          </strong>

          <span className="overview-main-label">
            Total Workouts
          </span>

          <p>
            Your recorded workout
            activity from AI FitTrack.
          </p>
        </div>

        <div className="overview-stats">
          <OverviewMetric
            icon={
              <Clock3 size={17} />
            }
            label="Total Duration"
            value={
              loading
                ? "—"
                : `${metrics.duration} min`
            }
          />

          <OverviewMetric
            icon={
              <Flame size={17} />
            }
            label="Calories Burned"
            value={
              loading
                ? "—"
                : metrics.calories
            }
          />

          <OverviewMetric
            icon={
              <Activity size={17} />
            }
            label="Average Duration"
            value={
              loading
                ? "—"
                : `${metrics.average} min`
            }
          />

          <OverviewMetric
            icon={
              <Sparkles size={17} />
            }
            label="Gemini AI"
            value="Ready"
          />
        </div>
      </section>

      <section className="dashboard-panel">
        <div className="panel-heading">
          <div>
            <span className="section-label">
              ACTIVITY ANALYTICS
            </span>

            <h2>
              Workout Activity Trend
            </h2>

            <p>
              Duration and calories from
              your recorded workouts.
            </p>
          </div>
        </div>

        {chartData.length > 0 ? (
          <div className="chart-area">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart
                data={chartData}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                />

                <YAxis
                  tickLine={false}
                  axisLine={false}
                />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="duration"
                  stroke="#7C3AED"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="calories"
                  stroke="#C084FC"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="empty-panel">
            {loading
              ? "Loading workout activity..."
              : "No workout activity available yet."}
          </div>
        )}
      </section>

      <section className="dashboard-panel">
        <div className="panel-heading">
          <div>
            <span className="section-label">
              RECENT ACTIVITY
            </span>

            <h2>
              Recent Workouts
            </h2>
          </div>
        </div>

        <div className="workout-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Workout</th>
                <th>Category</th>
                <th>Duration</th>
                <th>Calories</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {workouts
                .slice(0, 5)
                .map((workout) => (
                  <tr
                    key={workout._id}
                  >
                    <td>
                      <strong>
                        {
                          workout.workoutName
                        }
                      </strong>
                    </td>

                    <td>
                      {
                        workout.category
                      }
                    </td>

                    <td>
                      {
                        workout.duration
                      }{" "}
                      min
                    </td>

                    <td>
                      {
                        workout.caloriesBurned
                      }
                    </td>

                    <td>
                      {new Date(
                        workout.workoutDate
                      ).toLocaleDateString()}
                    </td>
                  </tr>
                ))}

              {!loading &&
                workouts.length ===
                  0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="empty-table-cell"
                    >
                      No workouts recorded yet.
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function OverviewMetric({
  icon,
  label,
  value,
}) {
  return (
    <article className="overview-metric">
      <div className="metric-icon">
        {icon}
      </div>

      <div>
        <span>{label}</span>

        <strong>{value}</strong>
      </div>
    </article>
  );
}