import {
  CalendarDays,
  Clock3,
  Dumbbell,
  Flame,
  LoaderCircle,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  workoutService,
} from "../../services/workoutService";

const emptyForm = {
  workoutName: "",
  category: "",
  duration: "",
  caloriesBurned: "",
  workoutDate: "",
};

export default function Workouts() {
  const [
    workouts,
    setWorkouts,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    deletingId,
    setDeletingId,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    modalOpen,
    setModalOpen,
  ] = useState(false);

  const [
    editingWorkout,
    setEditingWorkout,
  ] = useState(null);

  const [
    form,
    setForm,
  ] = useState(emptyForm);

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
      .catch(
        (requestError) => {
          if (active) {
            setError(
              requestError.message ||
                "Unable to load workouts"
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

  const metrics =
    useMemo(() => {
      const totalDuration =
        workouts.reduce(
          (total, workout) =>
            total +
            Number(
              workout.duration ||
                0
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

        duration:
          totalDuration,

        calories:
          totalCalories,
      };
    }, [workouts]);

  const filteredWorkouts =
    useMemo(() => {
      const value =
        search
          .trim()
          .toLowerCase();

      if (!value) {
        return workouts;
      }

      return workouts.filter(
        (workout) =>
          workout.workoutName
            ?.toLowerCase()
            .includes(value) ||
          workout.category
            ?.toLowerCase()
            .includes(value)
      );
    }, [
      workouts,
      search,
    ]);

  const openCreate =
    () => {
      setEditingWorkout(null);
      setForm(emptyForm);
      setError("");
      setSuccess("");
      setModalOpen(true);
    };

  const openEdit = (
    workout
  ) => {
    setEditingWorkout(
      workout
    );

    setForm({
      workoutName:
        workout.workoutName ||
        "",

      category:
        workout.category ||
        "",

      duration:
        String(
          workout.duration ??
            ""
        ),

      caloriesBurned:
        String(
          workout.caloriesBurned ??
            ""
        ),

      workoutDate:
        workout.workoutDate
          ? new Date(
              workout.workoutDate
            )
              .toISOString()
              .slice(0, 10)
          : "",
    });

    setError("");
    setSuccess("");
    setModalOpen(true);
  };

  const closeModal =
    () => {
      if (saving) {
        return;
      }

      setModalOpen(false);
      setEditingWorkout(null);
      setForm(emptyForm);
    };

  const handleFormChange = (
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

  const validateForm =
    () => {
      if (
        !form.workoutName.trim() ||
        !form.category.trim() ||
        !form.duration ||
        form.caloriesBurned ===
          "" ||
        !form.workoutDate
      ) {
        return (
          "Please complete all workout fields."
        );
      }

      if (
        Number(
          form.duration
        ) <= 0
      ) {
        return (
          "Duration must be greater than 0."
        );
      }

      if (
        Number(
          form.caloriesBurned
        ) < 0
      ) {
        return (
          "Calories burned cannot be negative."
        );
      }

      return "";
    };

  const submitWorkout =
    async (event) => {
      event.preventDefault();

      const validationError =
        validateForm();

      if (
        validationError
      ) {
        setError(
          validationError
        );

        return;
      }

      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        workoutName:
          form.workoutName.trim(),

        category:
          form.category.trim(),

        duration:
          Number(
            form.duration
          ),

        caloriesBurned:
          Number(
            form.caloriesBurned
          ),

        workoutDate:
          form.workoutDate,
      };

      try {
        if (
          editingWorkout
        ) {
          const response =
            await workoutService
              .updateWorkout(
                editingWorkout._id,
                payload
              );

          const updatedWorkout =
            response.data
              ?.workout;

          if (
            updatedWorkout
          ) {
            setWorkouts(
              (current) =>
                current.map(
                  (workout) =>
                    workout._id ===
                    updatedWorkout._id
                      ? updatedWorkout
                      : workout
                )
            );
          }

          setSuccess(
            "Workout updated successfully."
          );
        } else {
          const response =
            await workoutService
              .createWorkout(
                payload
              );

          const newWorkout =
            response.data
              ?.workout;

          if (newWorkout) {
            setWorkouts(
              (current) => [
                newWorkout,
                ...current,
              ]
            );
          }

          setSuccess(
            "Workout added successfully."
          );
        }

        setModalOpen(false);
        setEditingWorkout(null);
        setForm(emptyForm);
      } catch (
        requestError
      ) {
        setError(
          requestError.message ||
            "Unable to save workout"
        );
      } finally {
        setSaving(false);
      }
    };

  const deleteWorkout =
    async (workout) => {
      const confirmed =
        window.confirm(
          `Delete "${workout.workoutName}"?`
        );

      if (!confirmed) {
        return;
      }

      setDeletingId(
        workout._id
      );

      setError("");
      setSuccess("");

      try {
        await workoutService
          .deleteWorkout(
            workout._id
          );

        setWorkouts(
          (current) =>
            current.filter(
              (item) =>
                item._id !==
                workout._id
            )
        );

        setSuccess(
          "Workout deleted successfully."
        );
      } catch (
        requestError
      ) {
        setError(
          requestError.message ||
            "Unable to delete workout"
        );
      } finally {
        setDeletingId("");
      }
    };

  return (
    <main className="page-container workouts-page">
      <header className="workouts-page-header">
        <div>
          <span className="section-label">
            FITNESS ACTIVITY
          </span>

          <h1>
            My Workouts
          </h1>

          <p>
            Create, review and manage
            your recorded workout
            activity.
          </p>
        </div>

        <button
          type="button"
          className="workout-add-button"
          onClick={
            openCreate
          }
        >
          <Plus size={15} />

          Add Workout
        </button>
      </header>

      <section className="workout-summary-grid">
        <SummaryCard
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

        <SummaryCard
          icon={
            <Clock3
              size={18}
            />
          }
          label="Total Duration"
          value={
            loading
              ? "—"
              : `${metrics.duration} min`
          }
        />

        <SummaryCard
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

      {success && (
        <div className="page-success">
          {success}
        </div>
      )}

      <section className="dashboard-panel workouts-management-panel">
        <div className="workouts-toolbar">
          <div>
            <span className="section-label">
              WORKOUT HISTORY
            </span>

            <h2>
              Recorded Workouts
            </h2>
          </div>

          <div className="workout-list-search">
            <Search
              size={14}
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
              placeholder="Search workouts..."
            />
          </div>
        </div>

        {loading ? (
          <div className="workouts-loading">
            <LoaderCircle
              size={20}
            />

            Loading workouts...
          </div>
        ) : filteredWorkouts
            .length > 0 ? (
          <div className="workout-card-grid">
            {filteredWorkouts.map(
              (workout) => (
                <article
                  className="workout-management-card"
                  key={
                    workout._id
                  }
                >
                  <div className="workout-card-top">
                    <div className="workout-card-icon">
                      <Dumbbell
                        size={18}
                      />
                    </div>

                    <span className="workout-category-badge">
                      {
                        workout.category
                      }
                    </span>
                  </div>

                  <h3>
                    {
                      workout.workoutName
                    }
                  </h3>

                  <div className="workout-card-stats">
                    <span>
                      <Clock3
                        size={13}
                      />

                      {
                        workout.duration
                      }{" "}
                      min
                    </span>

                    <span>
                      <Flame
                        size={13}
                      />

                      {
                        workout.caloriesBurned
                      }{" "}
                      cal
                    </span>

                    <span>
                      <CalendarDays
                        size={13}
                      />

                      {new Date(
                        workout.workoutDate
                      ).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="workout-card-actions">
                    <button
                      type="button"
                      onClick={() =>
                        openEdit(
                          workout
                        )
                      }
                    >
                      <Pencil
                        size={13}
                      />

                      Edit
                    </button>

                    <button
                      type="button"
                      className="danger"
                      disabled={
                        deletingId ===
                        workout._id
                      }
                      onClick={() =>
                        deleteWorkout(
                          workout
                        )
                      }
                    >
                      {deletingId ===
                      workout._id ? (
                        <LoaderCircle
                          size={13}
                        />
                      ) : (
                        <Trash2
                          size={13}
                        />
                      )}

                      Delete
                    </button>
                  </div>
                </article>
              )
            )}
          </div>
        ) : (
          <div className="workouts-empty">
            <div>
              <Dumbbell
                size={24}
              />
            </div>

            <strong>
              {search
                ? "No matching workouts"
                : "No workouts recorded"}
            </strong>

            <p>
              {search
                ? "Try another workout name or category."
                : "Add your first workout to begin tracking your fitness activity."}
            </p>

            {!search && (
              <button
                type="button"
                onClick={
                  openCreate
                }
              >
                <Plus
                  size={14}
                />

                Add Workout
              </button>
            )}
          </div>
        )}
      </section>

      {modalOpen && (
        <div
          className="workout-modal-backdrop"
          onMouseDown={(
            event
          ) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }
          }}
        >
          <section
            className="workout-modal"
            role="dialog"
            aria-modal="true"
            aria-label={
              editingWorkout
                ? "Edit workout"
                : "Add workout"
            }
          >
            <header>
              <div>
                <span className="section-label">
                  {editingWorkout
                    ? "UPDATE ACTIVITY"
                    : "NEW ACTIVITY"}
                </span>

                <h2>
                  {editingWorkout
                    ? "Edit Workout"
                    : "Add Workout"}
                </h2>
              </div>

              <button
                type="button"
                className="workout-modal-close"
                onClick={
                  closeModal
                }
              >
                <X
                  size={17}
                />
              </button>
            </header>

            <form
              onSubmit={
                submitWorkout
              }
              className="workout-form"
            >
              <label>
                <span>
                  Workout Name
                </span>

                <input
                  type="text"
                  name="workoutName"
                  value={
                    form.workoutName
                  }
                  onChange={
                    handleFormChange
                  }
                  placeholder="Full Body Workout"
                  required
                />
              </label>

              <label>
                <span>
                  Category
                </span>

                <input
                  type="text"
                  name="category"
                  value={
                    form.category
                  }
                  onChange={
                    handleFormChange
                  }
                  placeholder="Strength"
                  required
                />
              </label>

              <div className="workout-form-row">
                <label>
                  <span>
                    Duration
                    (minutes)
                  </span>

                  <input
                    type="number"
                    name="duration"
                    value={
                      form.duration
                    }
                    onChange={
                      handleFormChange
                    }
                    min="1"
                    step="1"
                    required
                  />
                </label>

                <label>
                  <span>
                    Calories
                    Burned
                  </span>

                  <input
                    type="number"
                    name="caloriesBurned"
                    value={
                      form.caloriesBurned
                    }
                    onChange={
                      handleFormChange
                    }
                    min="0"
                    step="1"
                    required
                  />
                </label>
              </div>

              <label>
                <span>
                  Workout Date
                </span>

                <input
                  type="date"
                  name="workoutDate"
                  value={
                    form.workoutDate
                  }
                  onChange={
                    handleFormChange
                  }
                  required
                />
              </label>

              <div className="workout-form-actions">
                <button
                  type="button"
                  className="secondary"
                  onClick={
                    closeModal
                  }
                  disabled={
                    saving
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary"
                  disabled={
                    saving
                  }
                >
                  {saving && (
                    <LoaderCircle
                      size={14}
                    />
                  )}

                  {saving
                    ? "Saving..."
                    : editingWorkout
                      ? "Save Changes"
                      : "Add Workout"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}) {
  return (
    <article className="workout-summary-card">
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