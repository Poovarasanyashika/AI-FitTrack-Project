import {
  Activity,
  Clock3,
  Dumbbell,
  Flame,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  aiService,
} from "../../services/aiService";

import {
  workoutService,
} from "../../services/workoutService";

export default function FitnessInsights() {
  const [
    workouts,
    setWorkouts,
  ] = useState([]);

  const [
    insights,
    setInsights,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    generatedAt,
    setGeneratedAt,
  ] = useState(null);

  useEffect(() => {
    let active = true;

    Promise.all([
      workoutService.getWorkouts(),
      aiService.getFitnessInsights(),
    ])
      .then(
        ([
          workoutResponse,
          insightResponse,
        ]) => {
          if (!active) {
            return;
          }

          setWorkouts(
            workoutResponse.data
              ?.workouts || []
          );

          setInsights(
            insightResponse.data
              ?.insights || ""
          );

          setGeneratedAt(
            new Date()
          );

          setError("");
        }
      )
      .catch(
        (requestError) => {
          if (!active) {
            return;
          }

          setError(
            requestError.message ||
              "Unable to generate fitness insights."
          );
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

      const calories =
        workouts.reduce(
          (total, workout) =>
            total +
            Number(
              workout.caloriesBurned ||
                0
            ),
          0
        );

      const average =
        workouts.length > 0
          ? totalDuration /
            workouts.length
          : 0;

      return {
        count:
          workouts.length,

        totalDuration,

        calories,

        average:
          Number.isInteger(
            average
          )
            ? average
            : average.toFixed(1),
      };
    }, [workouts]);

  const refreshInsights =
    async () => {
      setLoading(true);
      setError("");

      try {
        const [
          workoutResponse,
          insightResponse,
        ] = await Promise.all([
          workoutService
            .getWorkouts(),

          aiService
            .getFitnessInsights(),
        ]);

        setWorkouts(
          workoutResponse.data
            ?.workouts || []
        );

        setInsights(
          insightResponse.data
            ?.insights || ""
        );

        setGeneratedAt(
          new Date()
        );
      } catch (
        requestError
      ) {
        setError(
          requestError.message ||
            "Unable to refresh fitness insights."
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <main className="page-container fitness-insights-page">
      <header className="fitness-insights-header">
        <div>
          <span className="section-label">
            GEMINI FITNESS INTELLIGENCE
          </span>

          <h1>
            Fitness Insights
          </h1>

          <p>
            Understand your workout
            performance, progress and
            improvement opportunities
            with Gemini AI.
          </p>
        </div>

        <button
          type="button"
          className="insights-refresh-button"
          onClick={
            refreshInsights
          }
          disabled={loading}
        >
          {loading ? (
            <LoaderCircle
              size={14}
              className="search-spinner"
            />
          ) : (
            <RefreshCw
              size={14}
            />
          )}

          Refresh Insights
        </button>
      </header>

      <section className="insights-metric-grid">
        <MetricCard
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

        <MetricCard
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

        <MetricCard
          icon={
            <TrendingUp
              size={18}
            />
          }
          label="Average Duration"
          value={
            loading
              ? "—"
              : `${metrics.average} min`
          }
        />

        <MetricCard
          icon={
            <Flame
              size={18}
            />
          }
          label="Calories Burned"
          value={
            loading
              ? "—"
              : metrics.calories
          }
        />
      </section>

      {error && (
        <div className="page-error">
          {error}
        </div>
      )}

      <section className="fitness-analysis-card">
        <header className="fitness-analysis-header">
          <div className="fitness-analysis-title">
            <div className="fitness-analysis-icon">
              <Sparkles
                size={18}
              />
            </div>

            <div>
              <span className="section-label">
                GEMINI ANALYSIS
              </span>

              <h2>
                Your Fitness Analysis
              </h2>
            </div>
          </div>

          {!loading &&
            insights && (
              <span className="ai-generated-badge">
                AI GENERATED
              </span>
            )}
        </header>

        {loading && (
          <div className="fitness-insights-loading">
            <div className="ai-loader">
              ✦
            </div>

            <strong>
              Gemini is analysing
              your workout history...
            </strong>

            <span>
              Reviewing workout
              performance and progress
            </span>
          </div>
        )}

        {!loading &&
          !error &&
          insights && (
            <>
              <div className="fitness-analysis-summary">
                <div>
                  <Activity
                    size={15}
                  />

                  <span>
                    Based on
                    <strong>
                      {
                        metrics.count
                      }{" "}
                      workouts
                    </strong>
                  </span>
                </div>

                {generatedAt && (
                  <small>
                    Generated{" "}
                    {generatedAt.toLocaleTimeString(
                      [],
                      {
                        hour: "2-digit",
                        minute:
                          "2-digit",
                      }
                    )}
                  </small>
                )}
              </div>

              <div className="fitness-insights-content">
                <AiFormattedText
                  text={
                    insights
                  }
                />
              </div>

              <footer className="fitness-analysis-footer">
                <ShieldCheck
                  size={13}
                />

                AI-generated fitness
                guidance based on your
                recorded workout
                activity.
              </footer>
            </>
          )}

        {!loading &&
          !error &&
          !insights && (
            <div className="fitness-insights-empty">
              <div>
                <Activity
                  size={25}
                />
              </div>

              <strong>
                No insights available
              </strong>

              <p>
                Record workout activity
                first, then generate
                fitness insights.
              </p>
            </div>
          )}
      </section>
    </main>
  );
}

function MetricCard({
  icon,
  label,
  value,
}) {
  return (
    <article className="insights-metric-card">
      <div>
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

function AiFormattedText({
  text,
}) {
  const lines =
    text
      .split("\n")
      .map((line) =>
        line.trim()
      )
      .filter(Boolean);

  return (
    <div className="ai-formatted-text">
      {lines.map(
        (line, index) => {
          const cleaned =
            line
              .replace(
                /^#{1,6}\s*/,
                ""
              )
              .replace(
                /\*\*/g,
                ""
              );

          if (
            line.startsWith(
              "#"
            )
          ) {
            return (
              <h3
                key={`${cleaned}-${index}`}
              >
                {cleaned}
              </h3>
            );
          }

          if (
            line.startsWith(
              "* "
            ) ||
            line.startsWith(
              "- "
            )
          ) {
            return (
              <div
                className="ai-insight-bullet"
                key={`${cleaned}-${index}`}
              >
                <span>
                  •
                </span>

                <p>
                  {cleaned.replace(
                    /^[*-]\s*/,
                    ""
                  )}
                </p>
              </div>
            );
          }

          return (
            <p
              key={`${cleaned}-${index}`}
            >
              {cleaned}
            </p>
          );
        }
      )}
    </div>
  );
}