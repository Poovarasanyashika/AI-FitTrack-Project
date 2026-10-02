import {
  CalendarDays,
  Clock3,
  Dumbbell,
  Flame,
  Search,
  TrendingUp,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  Area,
  AreaChart,
  CartesianGrid,
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
  const navigate =
    useNavigate();

  const {
    user,
  } = useAuth();

  const [
    workouts,
    setWorkouts,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  useEffect(() => {
    let active = true;

    workoutService
      .getWorkouts()
      .then((response) => {
        if (!active) {
          return;
        }

        setWorkouts(
          response.data
            ?.workouts || []
        );
      })
      .catch((requestError) => {
        if (active) {
          setError(
            requestError.message
          );
        }
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

  const sortedWorkouts =
    useMemo(
      () =>
        [...workouts].sort(
          (a, b) =>
            new Date(
              b.workoutDate
            ) -
            new Date(
              a.workoutDate
            )
        ),
      [workouts]
    );

  const latestWorkout =
    sortedWorkouts[0] || null;

  const metrics =
    useMemo(() => {
      const totalDuration =
        workouts.reduce(
          (total, workout) =>
            total +
            Number(
              workout.duration || 0
            ),
          0
        );

      const totalCalories =
        workouts.reduce(
          (total, workout) =>
            total +
            Number(
              workout.caloriesBurned ||
                0
            ),
          0
        );

      return {
        count:
          workouts.length,

        totalDuration,

        totalCalories,

        averageDuration:
          workouts.length > 0
            ? Math.round(
                totalDuration /
                  workouts.length
              )
            : 0,
      };
    }, [workouts]);

  const chartData =
    useMemo(
      () =>
        [...workouts]
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
                workout.duration || 0
              ),

            calories:
              Number(
                workout.caloriesBurned ||
                  0
              ),
          })),
      [workouts]
    );

  const submitSearch = (
    event
  ) => {
    event.preventDefault();

    const value =
      search.trim();

    if (!value) {
      navigate(
        "/workout-search"
      );

      return;
    }

    navigate(
      `/workout-search?q=${encodeURIComponent(
        value
      )}`
    );
  };

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

      <header className="fit-dashboard-header">
        <div>
          <h1>
            Hello,{" "}
            {user?.name ||
              "User"}
          </h1>

          <p>
            Track your workout activity
            and improve with AI-powered
            fitness intelligence.
          </p>
        </div>

        <form
          className="fit-page-search"
          onSubmit={
            submitSearch
          }
        >
          <Search
            size={15}
          />

          <input
            value={search}
            onChange={(
              event
            ) =>
              setSearch(
                event.target
                  .value
              )
            }
            placeholder="Search workout plans..."
          />

          <button type="submit">
            Search
          </button>
        </form>
      </header>

      {error && (
        <div className="page-error">
          {error}
        </div>
      )}

      <section className="fit-primary-card">
        <header className="fit-primary-card-header">
          <div>
            <span className="section-label">
              LATEST WORKOUT
            </span>

            <div className="fit-latest-title">
              <h2>
                {loading
                  ? "Loading..."
                  : latestWorkout
                    ? latestWorkout.workoutName
                    : "No workouts recorded"}
              </h2>

              {latestWorkout && (
                <span className="fit-recorded-badge">
                  RECORDED
                </span>
              )}
            </div>

            <p>
              {latestWorkout
                ? latestWorkout.category
                : "Add your first workout to start tracking activity."}
            </p>
          </div>

          <div className="fit-card-actions">
            <button
              type="button"
              onClick={() =>
                navigate(
                  "/workouts"
                )
              }
            >
              View Workouts
            </button>

            <button
              type="button"
              className="primary"
              onClick={() =>
                navigate(
                  "/ai-recommendation"
                )
              }
            >
              AI Insight
            </button>
          </div>
        </header>

        <div className="fit-telemetry-grid">
          <TelemetryItem
            icon={
              <Dumbbell
                size={18}
              />
            }
            label="Total Workouts"
            value={
              loading
                ? "—"
                : metrics.count
            }
          />

          <TelemetryItem
            icon={
              <Clock3
                size={18}
              />
            }
            label="Total Duration"
            value={
              loading
                ? "—"
                : `${metrics.totalDuration} min`
            }
          />

          <TelemetryItem
            icon={
              <Flame
                size={18}
              />
            }
            label="Calories Burned"
            value={
              loading
                ? "—"
                : metrics.totalCalories
            }
          />

          <TelemetryItem
            icon={
              <TrendingUp
                size={18}
              />
            }
            label="Average Duration"
            value={
              loading
                ? "—"
                : `${metrics.averageDuration} min`
            }
          />
        </div>

        {latestWorkout && (
          <div className="fit-detail-strip">
            <DetailItem
              label="Workout"
              value={
                latestWorkout.workoutName
              }
            />

            <DetailItem
              label="Category"
              value={
                latestWorkout.category
              }
            />

            <DetailItem
              label="Duration"
              value={`${latestWorkout.duration} min`}
            />

            <DetailItem
              label="Calories"
              value={
                latestWorkout.caloriesBurned
              }
            />

            <DetailItem
              label="Date"
              value={new Date(
                latestWorkout.workoutDate
              ).toLocaleDateString()}
            />
          </div>
        )}

        <div className="fit-trajectory">
          <div className="fit-trajectory-heading">
            <span className="section-label">
              RECENT WORKOUT ACTIVITY
            </span>
          </div>

          {sortedWorkouts.length >
          0 ? (
            <div className="fit-trajectory-row">
              {sortedWorkouts
                .slice(0, 6)
                .map(
                  (
                    workout
                  ) => (
                    <article
                      className="fit-trajectory-item"
                      key={
                        workout._id
                      }
                    >
                      <CalendarDays
                        size={14}
                      />

                      <strong>
                        {
                          workout.workoutName
                        }
                      </strong>

                      <span>
                        {
                          workout.category
                        }
                      </span>

                      <small>
                        {
                          workout.duration
                        }{" "}
                        min
                      </small>
                    </article>
                  )
                )}
            </div>
          ) : (
            <div className="fit-empty-strip">
              No recent workout
              activity.
            </div>
          )}
        </div>
      </section>

      <section className="dashboard-panel fit-chart-panel">
        <div className="panel-heading">
          <div>
            <span className="section-label">
              FITNESS TREND
            </span>

            <h2>
              Workout Activity Trend
            </h2>

            <p>
              Your workout duration and
              calorie activity over time.
            </p>
          </div>

          <div className="fit-chart-legend">
            <span>
              <i className="duration" />
              Duration
            </span>

            <span>
              <i className="calories" />
              Calories
            </span>
          </div>
        </div>

        {chartData.length >
        0 ? (
          <div className="chart-area">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <ResponsiveContainer
  width="100%"
  height="100%"
>
  <AreaChart
    data={chartData}
    margin={{
      top: 16,
      right: 18,
      left: -12,
      bottom: 0,
    }}
  >
    <defs>
      <linearGradient
        id="durationWave"
        x1="0"
        y1="0"
        x2="0"
        y2="1"
      >
        <stop
          offset="0%"
          stopColor="#7C3AED"
          stopOpacity={0.28}
        />

        <stop
          offset="100%"
          stopColor="#7C3AED"
          stopOpacity={0.02}
        />
      </linearGradient>

      <linearGradient
        id="calorieWave"
        x1="0"
        y1="0"
        x2="0"
        y2="1"
      >
        <stop
          offset="0%"
          stopColor="#C084FC"
          stopOpacity={0.2}
        />

        <stop
          offset="100%"
          stopColor="#C084FC"
          stopOpacity={0.01}
        />
      </linearGradient>
    </defs>

    <CartesianGrid
      stroke="#e7e9ef"
      strokeDasharray="4 4"
      vertical={false}
    />

    <XAxis
      dataKey="date"
      tickLine={false}
      axisLine={false}
      tick={{
        fontSize: 10,
        fill: "#7b8290",
      }}
    />

    <YAxis
      tickLine={false}
      axisLine={false}
      tick={{
        fontSize: 10,
        fill: "#7b8290",
      }}
    />

    <Tooltip />

    <Area
      type="natural"
      dataKey="duration"
      stroke="#7C3AED"
      strokeWidth={3}
      fill="url(#durationWave)"
      connectNulls
      activeDot={{
        r: 5,
      }}
    />

    <Area
      type="natural"
      dataKey="calories"
      stroke="#C084FC"
      strokeWidth={2}
      fill="url(#calorieWave)"
      connectNulls
      activeDot={{
        r: 4,
      }}
    />
  </AreaChart>
</ResponsiveContainer>
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
              WORKOUT HISTORY
            </span>

            <h2>
              Recent Workouts
            </h2>

            <p>
              Your latest recorded
              activity.
            </p>
          </div>

          <button
            type="button"
            className="fit-section-button"
            onClick={() =>
              navigate(
                "/workouts"
              )
            }
          >
            View All
          </button>
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
              {sortedWorkouts
                .slice(0, 5)
                .map(
                  (
                    workout
                  ) => (
                    <tr
                      key={
                        workout._id
                      }
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
                  )
                )}

              {!loading &&
                sortedWorkouts.length ===
                  0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="empty-table-cell"
                    >
                      No workouts
                      recorded yet.
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

function TelemetryItem({
  icon,
  label,
  value,
}) {
  return (
    <article className="fit-telemetry-item">
      <div className="fit-telemetry-icon">
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

function DetailItem({
  label,
  value,
}) {
  return (
    <div className="fit-detail-item">
      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>
    </div>
  );
}
