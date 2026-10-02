const sanitizeLimit = (value, fallback = 10, maximum = 50) => {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.min(parsed, maximum);
};

const buildWorkoutSearchText = (workout) => {
  const parts = [
    workout.workoutName,
    workout.category,
    workout.duration !== undefined && workout.duration !== null
      ? `${workout.duration} minute workout`
      : null,
    workout.caloriesBurned !== undefined && workout.caloriesBurned !== null
      ? `${workout.caloriesBurned} calories`
      : null,
    workout.workoutDate
      ? new Date(workout.workoutDate).toISOString().slice(0, 10)
      : null,
  ];

  return parts
    .filter((value) => value !== null && value !== undefined && value !== "")
    .join(" | ");
};

const cosineSimilarity = (left, right) => {
  if (
    !Array.isArray(left) ||
    !Array.isArray(right) ||
    left.length === 0 ||
    left.length !== right.length
  ) {
    return -1;
  }

  let dot = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;

  for (let index = 0; index < left.length; index += 1) {
    const leftValue = Number(left[index]);
    const rightValue = Number(right[index]);

    if (!Number.isFinite(leftValue) || !Number.isFinite(rightValue)) {
      return -1;
    }

    dot += leftValue * rightValue;
    leftMagnitude += leftValue * leftValue;
    rightMagnitude += rightValue * rightValue;
  }

  if (leftMagnitude === 0 || rightMagnitude === 0) {
    return -1;
  }

  return dot / (Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude));
};

const rankWorkoutsByEmbedding = (workouts, queryEmbedding, limit = 10) =>
  workouts
    .map((workout) => ({
      workout,
      score: cosineSimilarity(workout.embedding, queryEmbedding),
    }))
    .filter((entry) => entry.score >= 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit);

module.exports = {
  sanitizeLimit,
  buildWorkoutSearchText,
  cosineSimilarity,
  rankWorkoutsByEmbedding,
};
