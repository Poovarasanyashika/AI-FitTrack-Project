import { apiRequest } from "./api";

const getWorkoutRecommendation = ({
  age,
  fitnessGoal,
  experienceLevel,
}) =>
  apiRequest(
    "/ai/workout-recommendation",
    {
      method: "POST",
      body: {
        age,
        fitnessGoal,
        experienceLevel,
      },
    }
  );

const getFitnessInsights = () =>
  apiRequest(
    "/ai/fitness-insights"
  );

export const aiService = {
  getWorkoutRecommendation,
  getFitnessInsights,
};