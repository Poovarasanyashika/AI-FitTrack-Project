import AiRichText from "../../components/common/AiRichText";
import {
  Bot,
  Dumbbell,
  LoaderCircle,
  Search,
  Sparkles,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  useSearchParams,
} from "react-router-dom";

import {
  chatbotService,
} from "../../services/chatbotService";

import {
  workoutService,
} from "../../services/workoutService";

export default function WorkoutSearch() {
  const [
    params,
    setParams,
  ] = useSearchParams();

  const initialQuery =
    params.get("q") || "";

  const [
    query,
    setQuery,
  ] = useState(initialQuery);

  const [
    aiResult,
    setAiResult,
  ] = useState("");

  const [
    recordedWorkouts,
    setRecordedWorkouts,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(
    Boolean(initialQuery)
  );

  const [
    error,
    setError,
  ] = useState("");

  /*
   * Used when the user searches the
   * exact same query again.
   *
   * Normal new searches are driven
   * by the URL query parameter below.
   */
  const runSearch = async (
    searchQuery
  ) => {
    const value =
      searchQuery.trim();

    if (!value) {
      return;
    }

    setLoading(true);
    setError("");
    setAiResult("");
    setRecordedWorkouts([]);

    try {
      const [
        aiResponse,
        workoutResponse,
      ] = await Promise.all([
        chatbotService.sendMessage(
          value
        ),

        workoutService
          .semanticSearchWorkouts(value)
          .catch(() =>
            workoutService.searchWorkouts(value)
          )
          .catch(() => ({
            data: {
              workouts: [],
            },
          })),
      ]);

      setAiResult(
        aiResponse.data
          ?.response || ""
      );

      setRecordedWorkouts(
        workoutResponse.data
          ?.workouts || []
      );
    } catch (
      requestError
    ) {
      setError(
        requestError.message ||
          "Unable to generate workout plan"
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * URL-driven search.
   *
   * Example:
   * /workout-search?q=beginner+full+body
   *
   * This allows Dashboard/navbar search
   * to open this page and automatically
   * execute the Gemini request.
   */
  useEffect(() => {
    if (!initialQuery) {
      return undefined;
    }

    let active = true;

    Promise.all([
      chatbotService.sendMessage(
        initialQuery
      ),

      workoutService
        .semanticSearchWorkouts(
          initialQuery
        )
        .catch(() =>
          workoutService.searchWorkouts(
            initialQuery
          )
        )
        .catch(() => ({
          data: {
            workouts: [],
          },
        })),
    ])
      .then(
        ([
          aiResponse,
          workoutResponse,
        ]) => {
          if (!active) {
            return;
          }

          setError("");

          setAiResult(
            aiResponse.data
              ?.response || ""
          );

          setRecordedWorkouts(
            workoutResponse.data
              ?.workouts || []
          );
        }
      )
      .catch(
        (requestError) => {
          if (!active) {
            return;
          }

          setError(
            requestError.message ||
              "Unable to generate workout plan"
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
  }, [initialQuery]);

  const submit = (
    event
  ) => {
    event.preventDefault();

    const value =
      query.trim();

    if (!value) {
      return;
    }

    const currentQuery =
      params.get("q") || "";

    /*
     * Same query:
     * URL will not change, so manually
     * execute another search.
     */
    if (
      currentQuery === value
    ) {
      runSearch(value);

      return;
    }

    /*
     * New query:
     * prepare loading state and update URL.
     * useEffect performs the API request.
     */
    setError("");
    setAiResult("");
    setRecordedWorkouts([]);
    setLoading(true);

    setParams({
      q: value,
    });
  };

  return (
    <main className="page-container workout-search-page">
      <header className="workout-search-heading">
        <span className="section-label">
          GEMINI FITNESS SEARCH
        </span>

        <h1>
          Workout Plan Search
        </h1>

        <p>
          Search for a workout goal
          and let Gemini AI generate
          fitness guidance for you.
        </p>
      </header>

      <form
        className="workout-ai-search"
        onSubmit={submit}
      >
        <Search size={17} />

        <input
          value={query}
          onChange={(event) =>
            setQuery(
              event.target.value
            )
          }
          placeholder="Try: beginner full body workout"
        />

        <button
          type="submit"
          disabled={
            loading ||
            !query.trim()
          }
        >
          {loading ? (
            <>
              <LoaderCircle
                size={14}
                className="search-spinner"
              />

              Generating
            </>
          ) : (
            <>
              <Sparkles
                size={14}
              />

              Search
            </>
          )}
        </button>
      </form>

      <div className="workout-search-suggestions">
        <button
          type="button"
          onClick={() =>
            setQuery(
              "Beginner full body workout"
            )
          }
        >
          Beginner Full Body
        </button>

        <button
          type="button"
          onClick={() =>
            setQuery(
              "Fat loss workout"
            )
          }
        >
          Fat Loss
        </button>

        <button
          type="button"
          onClick={() =>
            setQuery(
              "Upper body strength workout"
            )
          }
        >
          Upper Body
        </button>

        <button
          type="button"
          onClick={() =>
            setQuery(
              "Home workout without equipment"
            )
          }
        >
          Home Workout
        </button>
      </div>

      {error && (
        <div className="page-error">
          {error}
        </div>
      )}

      {loading && (
        <section className="ai-search-loading">
          <div className="ai-loader">
            âœ¦
          </div>

          <strong>
            Gemini is preparing
            your workout plan...
          </strong>

          <span>
            Analysing your fitness
            request
          </span>
        </section>
      )}

      {!loading &&
        aiResult && (
          <section className="ai-workout-result">
            <header>
              <div className="ai-result-heading">
                <div className="ai-result-icon">
                  <Sparkles
                    size={18}
                  />
                </div>

                <div>
                  <span className="section-label">
                    GEMINI FITNESS
                    INTELLIGENCE
                  </span>

                  <h2>
                    AI Workout Plan
                  </h2>
                </div>
              </div>

              <span className="ai-generated-badge">
                AI GENERATED
              </span>
            </header>

            <div className="ai-result-query">
              <Search
                size={14}
              />

              <span>
                {params.get("q")}
              </span>
            </div>

            <div className="ai-result-content">
              <Bot size={18} />

              <div>
                <AiRichText text={aiResult} />
              </div>
            </div>

            <footer>
              <Dumbbell
                size={13}
              />

              AI-generated fitness
              guidance. Adjust
              exercises to your
              ability and safety.
            </footer>
          </section>
        )}

      {!loading &&
        recordedWorkouts.length >
          0 && (
          <section className="dashboard-panel">
            <div className="panel-heading">
              <div>
                <span className="section-label">
                  YOUR ACTIVITY
                </span>

                <h2>
                  Matching Recorded
                  Workouts
                </h2>

                <p>
                  Existing workouts
                  ranked by semantic
                  relevance.
                </p>
              </div>
            </div>

            <div className="recorded-result-grid">
              {recordedWorkouts.map(
                (workout) => (
                  <article
                    key={
                      workout._id
                    }
                    className="recorded-workout-result"
                  >
                    <Dumbbell
                      size={17}
                    />

                    <span>
                      {
                        workout.category
                      }
                    </span>

                    <strong>
                      {
                        workout.workoutName
                      }
                    </strong>

                    <div>
                      {
                        workout.duration
                      }{" "}
                      min

                      <i />

                      {
                        workout.caloriesBurned
                      }{" "}
                      cal
                    </div>
                  </article>
                )
              )}
            </div>
          </section>
        )}

      {!loading &&
        !aiResult &&
        !error && (
          <section className="workout-search-empty">
            <div>
              <Sparkles
                size={25}
              />
            </div>

            <strong>
              Search with Gemini
            </strong>

            <p>
              Enter a workout type,
              fitness goal, or
              training question to
              generate a plan.
            </p>
          </section>
        )}
    </main>
  );
}
