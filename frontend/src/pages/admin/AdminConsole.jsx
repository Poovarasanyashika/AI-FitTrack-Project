import {
  Activity,
  Clock3,
  Database,
  Dumbbell,
  Flame,
  RefreshCw,
  ShieldCheck,
  Users,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useSearchParams,
} from "react-router-dom";

import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  adminService,
} from "../../services/adminService";

const TAB_MAP = {
  overview:
    "Overview & Analytics",

  users:
    "Users",

  workouts:
    "Workouts",

  reports:
    "Reports & Analytics",

  health:
    "System Health",
};

const SECTION_META = {
  overview: {
    title:
      "Admin Dashboard",

    description:
      "Monitor users, workouts, analytics and AI FitTrack system health.",
  },

  users: {
    title:
      "User Governance",

    description:
      "Review registered AI FitTrack users and account roles.",
  },

  workouts: {
    title:
      "Workout Governance",

    description:
      "Review workout activity across the AI FitTrack platform.",
  },

  reports: {
    title:
      "Reports & Analytics",

    description:
      "Review workout category performance and user distribution.",
  },

  health: {
    title:
      "System Health",

    description:
      "Monitor API availability, MongoDB connectivity and uptime.",
  },
};

async function fetchAdminData() {
  const [
    dashboard,
    users,
    workouts,
    reports,
    systemHealth,
  ] = await Promise.all([
    adminService.getDashboard(),
    adminService.getUsers(),
    adminService.getWorkouts(),
    adminService.getReports(),
    adminService.getSystemHealth(),
  ]);

  return {
    overview: dashboard.data,
    users: users.data.users || [],
    workouts: workouts.data.workouts || [],
    workoutAnalytics:
      reports.data.categoryDistribution || [],
    userAnalytics:
      reports.data.roleDistribution || [],
    systemHealth: systemHealth.data,
  };
}

export default function AdminConsole() {
  const [
    searchParams,
  ] = useSearchParams();

  const requestedTab =
    searchParams.get(
      "tab"
    ) || "overview";

  const tabKey =
    Object.prototype
      .hasOwnProperty.call(
        TAB_MAP,
        requestedTab
      )
      ? requestedTab
      : "overview";

  const activeTab =
    TAB_MAP[
      tabKey
    ];

  const sectionMeta =
    SECTION_META[
      tabKey
    ];

  const [
    state,
    setState,
  ] = useState({
    loading: true,
    error: "",
    overview: null,
    users: [],
    workouts: [],
    workoutAnalytics: [],
    userAnalytics: [],
    systemHealth: null,
  });

  useEffect(() => {
    let active = true;

    fetchAdminData()
      .then(
        (data) => {
          if (!active) {
            return;
          }

          setState({
            loading: false,
            error: "",
            ...data,
          });
        }
      )
      .catch(
        (error) => {
          if (!active) {
            return;
          }

          setState(
            (
              current
            ) => ({
              ...current,

              loading:
                false,

              error:
                error.message ||
                "Unable to load admin data.",
            })
          );
        }
      );

    return () => {
      active = false;
    };
  }, []);

  const refreshData =
    async () => {
      setState(
        (
          current
        ) => ({
          ...current,
          loading: true,
          error: "",
        })
      );

      try {
        const data =
          await fetchAdminData();

        setState({
          loading: false,
          error: "",
          ...data,
        });
      } catch (
        error
      ) {
        setState(
          (
            current
          ) => ({
            ...current,

            loading:
              false,

            error:
              error.message ||
              "Unable to refresh admin data.",
          })
        );
      }
    };

  const overview =
    state.overview;

  const trendData =
    useMemo(() => {
      const grouped =
        new Map();

      state.workouts
        .forEach(
          (
            workout
          ) => {
            const date =
              new Date(
                workout.workoutDate
              );

            if (
              Number.isNaN(
                date.getTime()
              )
            ) {
              return;
            }

            const key =
              [
                date.getFullYear(),

                String(
                  date.getMonth() +
                    1
                ).padStart(
                  2,
                  "0"
                ),

                String(
                  date.getDate()
                ).padStart(
                  2,
                  "0"
                ),
              ].join(
                "-"
              );

            const current =
              grouped.get(
                key
              ) || {
                key,

                date:
                  date
                    .toLocaleDateString(
                      undefined,
                      {
                        month:
                          "short",

                        day:
                          "numeric",
                      }
                    ),

                duration:
                  0,

                calories:
                  0,

                workouts:
                  0,
              };

            current.duration +=
              Number(
                workout.duration ||
                  0
              );

            current.calories +=
              Number(
                workout
                  .caloriesBurned ||
                  0
              );

            current.workouts +=
              1;

            grouped.set(
              key,
              current
            );
          }
        );

      return [
        ...grouped.values(),
      ].sort(
        (
          a,
          b
        ) =>
          a.key.localeCompare(
            b.key
          )
      );
    }, [
      state.workouts,
    ]);

  return (
    <main className="page-container admin-page">
      <div className="dashboard-kicker">
        <ShieldCheck
          size={13}
        />

        Administrator Governance Console
      </div>

      <header className="page-title-row">
        <div>
          <h1>
            {
              sectionMeta.title
            }
          </h1>

          <p>
            {
              sectionMeta.description
            }
          </p>
        </div>

        <button
          type="button"
          className="refresh-button"
          onClick={
            refreshData
          }
          disabled={
            state.loading
          }
        >
          <RefreshCw
            size={14}
          />

          {state.loading
            ? "Refreshing..."
            : "Refresh Metrics"}
        </button>
      </header>

      {state.error && (
        <div className="page-error">
          {state.error}
        </div>
      )}

      {activeTab ===
        "Overview & Analytics" && (
        <>
          <div className="admin-stat-grid">
            <AdminMetric
              icon={
                <Users
                  size={18}
                />
              }
              label="Total Users"
              value={
                overview
                  ?.totalUsers ??
                "—"
              }
            />

            <AdminMetric
              icon={
                <ShieldCheck
                  size={18}
                />
              }
              label="Admins"
              value={
                overview
                  ?.totalAdmins ??
                "—"
              }
            />

            <AdminMetric
              icon={
                <Dumbbell
                  size={18}
                />
              }
              label="Total Workouts"
              value={
                overview
                  ?.totalWorkouts ??
                "—"
              }
            />

            <AdminMetric
              icon={
                <Flame
                  size={18}
                />
              }
              label="Total Calories"
              value={
                overview
                  ?.totalCaloriesBurned ??
                "—"
              }
            />

            <AdminMetric
              icon={
                <Clock3
                  size={18}
                />
              }
              label="Avg Duration"
              value={
                overview
                  ? `${overview.averageWorkoutDuration} min`
                  : "—"
              }
            />
          </div>

          <section className="dashboard-panel admin-trend-panel">
            <div className="panel-heading">
              <div>
                <span className="section-label">
                  SYSTEM ACTIVITY
                </span>

                <h2>
                  Workout Activity Trend
                </h2>

                <p>
                  System-wide workout duration and calorie activity over time.
                </p>
              </div>
            </div>

            <div className="admin-trend-chart">
              {trendData.length ? (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <LineChart
                    data={
                      trendData
                    }
                    margin={{
                      top: 20,
                      right: 20,
                      left: 0,
                      bottom: 0,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="4 4"
                      vertical={
                        false
                      }
                      stroke="#e7e9ef"
                    />

                    <XAxis
                      dataKey="date"
                      tick={{
                        fontSize:
                          9,
                      }}
                      axisLine={
                        false
                      }
                      tickLine={
                        false
                      }
                    />

                    <YAxis
                      yAxisId="duration"
                      tick={{
                        fontSize:
                          9,
                      }}
                      axisLine={
                        false
                      }
                      tickLine={
                        false
                      }
                    />

                    <YAxis
                      yAxisId="calories"
                      orientation="right"
                      tick={{
                        fontSize:
                          9,
                      }}
                      axisLine={
                        false
                      }
                      tickLine={
                        false
                      }
                    />

                    <Tooltip />

                    <Legend />

                    <Line
                      yAxisId="duration"
                      type="monotone"
                      dataKey="duration"
                      name="Duration"
                      stroke="#BE185D"
                      strokeWidth={
                        3
                      }
                      dot={{
                        r: 4,
                      }}
                      activeDot={{
                        r: 6,
                      }}
                    />

                    <Line
                      yAxisId="calories"
                      type="monotone"
                      dataKey="calories"
                      name="Calories"
                      stroke="#C084FC"
                      strokeWidth={
                        3
                      }
                      dot={{
                        r: 4,
                      }}
                      activeDot={{
                        r: 6,
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="admin-trend-empty">
                  No workout activity available yet.
                </div>
              )}
            </div>
          </section>

          <div className="admin-overview-grid">
            <section className="dashboard-panel">
              <div className="panel-heading">
                <div>
                  <span className="section-label">
                    WORKOUT DISTRIBUTION
                  </span>

                  <h2>
                    Category Analytics
                  </h2>
                </div>
              </div>

              <div className="admin-chart-container">
                {(overview
                  ?.categoryDistribution ||
                  []
                ).length ? (
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <PieChart>
                      <Pie
                        data={
                          overview
                            ?.categoryDistribution ||
                          []
                        }
                        dataKey="count"
                        nameKey="category"
                        innerRadius={
                          65
                        }
                        outerRadius={
                          95
                        }
                        paddingAngle={
                          3
                        }
                      >
                        {(overview
                          ?.categoryDistribution ||
                          []
                        ).map(
                          (
                            item,
                            index
                          ) => (
                            <Cell
                              key={
                                item.category
                              }
                              fill={
                                index %
                                  2 ===
                                0
                                  ? "#BE185D"
                                  : "#C084FC"
                              }
                            />
                          )
                        )}
                      </Pie>

                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="admin-trend-empty">
                    No category data available.
                  </div>
                )}
              </div>
            </section>

            <SystemHealthCard
              data={
                state.systemHealth
              }
            />
          </div>
        </>
      )}

      {activeTab ===
        "Users" && (
        <UsersTable
          users={
            state.users
          }
        />
      )}

      {activeTab ===
        "Workouts" && (
        <WorkoutsTable
          workouts={
            state.workouts
          }
        />
      )}

      {activeTab ===
        "Reports & Analytics" && (
        <Reports
          workoutAnalytics={
            state.workoutAnalytics
          }
          userAnalytics={
            state.userAnalytics
          }
        />
      )}

      {activeTab ===
        "System Health" && (
        <SystemHealthCard
          data={
            state.systemHealth
          }
          full
        />
      )}
    </main>
  );
}

function AdminMetric({
  icon,
  label,
  value,
}) {
  return (
    <article className="admin-stat-card">
      <div className="admin-stat-icon">
        {icon}
      </div>

      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>
    </article>
  );
}

function UsersTable({
  users,
}) {
  return (
    <section className="dashboard-panel">
      <div className="panel-heading">
        <div>
          <span className="section-label">
            USER GOVERNANCE
          </span>

          <h2>
            Registered Users
          </h2>

          <p>
            Read-only user administration.
          </p>
        </div>
      </div>

      <div className="workout-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>
                Registered
              </th>
            </tr>
          </thead>

          <tbody>
            {users.map(
              (
                user
              ) => (
                <tr
                  key={
                    user.id
                  }
                >
                  <td>
                    <strong>
                      {
                        user.name
                      }
                    </strong>
                  </td>

                  <td>
                    {
                      user.email
                    }
                  </td>

                  <td>
                    <span
                      className={`role-badge ${user.role}`}
                    >
                      {
                        user.role
                      }
                    </span>
                  </td>

                  <td>
                    {user.createdAt
                      ? new Date(
                          user.createdAt
                        ).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function WorkoutsTable({
  workouts,
}) {
  return (
    <section className="dashboard-panel">
      <div className="panel-heading">
        <div>
          <span className="section-label">
            WORKOUT GOVERNANCE
          </span>

          <h2>
            All Workouts
          </h2>

          <p>
            Read-only system workout administration.
          </p>
        </div>
      </div>

      <div className="workout-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Workout</th>
              <th>Category</th>
              <th>Duration</th>
              <th>Calories</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {workouts.map(
              (
                workout
              ) => (
                <tr
                  key={
                    workout._id ||
                    workout.id
                  }
                >
                  <td>
                    {
                      workout
                        .user
                        ?.name ||
                      "—"
                    }
                  </td>

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
                    {workout.workoutDate
                      ? new Date(
                          workout.workoutDate
                        ).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Reports({
  workoutAnalytics,
  userAnalytics,
}) {
  return (
    <div className="report-grid">
      <section className="dashboard-panel">
        <div className="panel-heading">
          <div>
            <span className="section-label">
              WORKOUT REPORTS
            </span>

            <h2>
              Workout Analytics
            </h2>
          </div>
        </div>

        {workoutAnalytics.length ? (
          workoutAnalytics.map(
            (
              item
            ) => (
              <div
                className="report-row"
                key={
                  item.category
                }
              >
                <strong>
                  {
                    item.category
                  }
                </strong>

                <span>
                  {
                    item.workoutCount
                  }{" "}
                  workouts
                </span>

                <span>
                  {
                    item.totalDuration
                  }{" "}
                  min
                </span>

                <span>
                  {
                    item.totalCaloriesBurned
                  }{" "}
                  cal
                </span>
              </div>
            )
          )
        ) : (
          <div className="admin-trend-empty">
            No workout analytics available.
          </div>
        )}
      </section>

      <section className="dashboard-panel">
        <div className="panel-heading">
          <div>
            <span className="section-label">
              USER REPORTS
            </span>

            <h2>
              User Distribution
            </h2>
          </div>
        </div>

        {userAnalytics.length ? (
          userAnalytics.map(
            (
              item
            ) => (
              <div
                className="report-row"
                key={
                  item.role
                }
              >
                <strong>
                  {
                    item.role
                  }
                </strong>

                <span>
                  {
                    item.count
                  }
                </span>
              </div>
            )
          )
        ) : (
          <div className="admin-trend-empty">
            No user analytics available.
          </div>
        )}
      </section>
    </div>
  );
}

function SystemHealthCard({
  data,
  full = false,
}) {
  return (
    <section
      className={`dashboard-panel system-health-panel ${
        full
          ? "full"
          : ""
      }`}
    >
      <div className="panel-heading">
        <div>
          <span className="section-label">
            SYSTEM HEALTH
          </span>

          <h2>
            System Health & Services
          </h2>
        </div>
      </div>

      <div className="health-row">
        <span>
          <Activity
            size={16}
          />

          Core API
        </span>

        <strong className="healthy">
          {data?.api ||
            "—"}
        </strong>
      </div>

      <div className="health-row">
        <span>
          <Database
            size={16}
          />

          MongoDB
        </span>

        <strong className="healthy">
          {data?.database ||
            "—"}
        </strong>
      </div>

      <div className="health-row">
        <span>
          Uptime
        </span>

        <strong>
          {data
            ? `${data.uptimeSeconds}s`
            : "—"}
        </strong>
      </div>

      <div className="health-row">
        <span>
          Last Checked
        </span>

        <strong>
          {data?.timestamp
            ? new Date(
                data.timestamp
              ).toLocaleTimeString()
            : "—"}
        </strong>
      </div>
    </section>
  );
}
