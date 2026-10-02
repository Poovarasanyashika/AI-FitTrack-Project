import AiRichText from "../../components/common/AiRichText";
import {
  Dumbbell,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
  Target,
  UserRound,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  aiService,
} from "../../services/aiService";

const initialForm = {
  age: "",
  fitnessGoal: "",
  experienceLevel:
    "Beginner",
};

export default function AIRecommendation() {
  const [
    form,
    setForm,
  ] = useState(initialForm);

  const [
    recommendation,
    setRecommendation,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const handleChange = (
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

  const submit = async (
    event
  ) => {
    event.preventDefault();

    const parsedAge =
      Number(form.age);

    if (
      !Number.isInteger(
        parsedAge
      ) ||
      parsedAge <= 0
    ) {
      setError(
        "Enter a valid age."
      );

      return;
    }

    if (
      !form.fitnessGoal.trim()
    ) {
      setError(
        "Fitness goal is required."
      );

      return;
    }

    if (
      !form.experienceLevel
    ) {
      setError(
        "Experience level is required."
      );

      return;
    }

    setLoading(true);
    setError("");
    setRecommendation("");

    try {
      const response =
        await aiService
          .getWorkoutRecommendation({
            age: parsedAge,
            fitnessGoal:
              form.fitnessGoal
                .trim(),
            experienceLevel:
              form.experienceLevel,
          });

      const result =
        response.data
          ?.recommendation;

      if (!result) {
        throw new Error(
          "Gemini returned an empty recommendation."
        );
      }

      setRecommendation(
        result
      );
    } catch (
      requestError
    ) {
      setError(
        requestError.message ||
          "Unable to generate recommendation."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-container ai-recommendation-page">
      <header className="ai-rec-page-header">
        <div>
          <span className="section-label">
            GEMINI FITNESS INTELLIGENCE
          </span>

          <h1>
            AI Workout Recommendation
          </h1>

          <p>
            Generate personalized
            workout guidance using
            your age, fitness goal
            and experience level.
          </p>
        </div>

        <div className="ai-rec-status">
          <Sparkles
            size={14}
          />

          Powered by Gemini
        </div>
      </header>

      <div className="ai-rec-layout">
        <section className="ai-rec-form-card">
          <header>
            <div className="ai-rec-header-icon">
              <Target
                size={19}
              />
            </div>

            <div>
              <span className="section-label">
                YOUR FITNESS PROFILE
              </span>

              <h2>
                Recommendation Setup
              </h2>
            </div>
          </header>

          <form
            className="ai-rec-form"
            onSubmit={submit}
          >
            <label>
              <span>
                Age
              </span>

              <div className="ai-rec-input">
                <UserRound
                  size={15}
                />

                <input
                  type="number"
                  name="age"
                  min="1"
                  step="1"
                  value={
                    form.age
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter your age"
                  required
                />
              </div>
            </label>

            <label>
              <span>
                Fitness Goal
              </span>

              <div className="ai-rec-input">
                <Target
                  size={15}
                />

                <input
                  type="text"
                  name="fitnessGoal"
                  value={
                    form.fitnessGoal
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Example: Build strength"
                  required
                />
              </div>
            </label>

            <label>
              <span>
                Experience Level
              </span>

              <select
                name="experienceLevel"
                value={
                  form.experienceLevel
                }
                onChange={
                  handleChange
                }
              >
                <option value="Beginner">
                  Beginner
                </option>

                <option value="Intermediate">
                  Intermediate
                </option>

                <option value="Advanced">
                  Advanced
                </option>
              </select>
            </label>

            {error && (
              <div className="page-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="ai-rec-submit"
              disabled={
                loading
              }
            >
              {loading ? (
                <>
                  <LoaderCircle
                    size={15}
                    className="search-spinner"
                  />

                  Generating...
                </>
              ) : (
                <>
                  <Sparkles
                    size={15}
                  />

                  Generate Recommendation
                </>
              )}
            </button>
          </form>

          <footer className="ai-rec-form-footer">
            <ShieldCheck
              size={14}
            />

            Gemini API requests
            are processed through
            the AI FitTrack backend.
          </footer>
        </section>

        <section className="ai-rec-result-card">
          {!loading &&
            !recommendation && (
              <div className="ai-rec-empty">
                <div>
                  <Sparkles
                    size={28}
                  />
                </div>

                <strong>
                  Personalized
                  fitness guidance
                </strong>

                <p>
                  Complete your
                  fitness profile
                  and generate an
                  AI-powered workout
                  recommendation.
                </p>

                <div className="ai-rec-capabilities">
                  <span>
                    Workout Plan
                  </span>

                  <span>
                    Weekly Guidance
                  </span>

                  <span>
                    Training Tips
                  </span>

                  <span>
                    Safety Tips
                  </span>
                </div>
              </div>
            )}

          {loading && (
            <div className="ai-rec-loading">
              <div className="ai-loader">
                ✦
              </div>

              <strong>
                Gemini is building
                your recommendation...
              </strong>

              <span>
                Preparing personalized
                fitness guidance
              </span>
            </div>
          )}

          {!loading &&
            recommendation && (
              <>
                <header className="ai-rec-result-header">
                  <div>
                    <span className="section-label">
                      GEMINI RESULT
                    </span>

                    <h2>
                      Personalized
                      Workout Plan
                    </h2>
                  </div>

                  <span className="ai-generated-badge">
                    AI GENERATED
                  </span>
                </header>

                <div className="ai-rec-profile-strip">
                  <span>
                    Age
                    <strong>
                      {form.age}
                    </strong>
                  </span>

                  <span>
                    Goal
                    <strong>
                      {
                        form.fitnessGoal
                      }
                    </strong>
                  </span>

                  <span>
                    Level
                    <strong>
                      {
                        form.experienceLevel
                      }
                    </strong>
                  </span>
                </div>

                <div className="ai-rec-content">
                  <div className="ai-rec-bot-icon">
                    <Dumbbell
                      size={17}
                    />
                  </div>

                  <div>
                    <AiRichText text={recommendation} />
                  </div>
                </div>

                <footer className="ai-rec-result-footer">
                  <ShieldCheck
                    size={13}
                  />

                  Follow exercises
                  according to your
                  ability and safety.
                </footer>
              </>
            )}
        </section>
      </div>
    </main>
  );
}
