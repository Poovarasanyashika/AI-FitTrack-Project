const { GoogleGenAI } = require("@google/genai");

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";

const getGeminiClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
};

const generateContent = async (prompt) => {
  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    throw new Error("Gemini prompt is required");
  }

  const ai = getGeminiClient();

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt.trim(),
  });

  const text = response.text;

  if (!text || !text.trim()) {
    throw new Error("Gemini returned an empty response");
  }

  return text.trim();
};

const generateWorkoutRecommendation = async ({
  age,
  fitnessGoal,
  experienceLevel,
}) => {
  if (age === undefined || age === null || age === "") {
    throw new Error("Age is required");
  }

  const parsedAge = Number(age);

  if (!Number.isInteger(parsedAge) || parsedAge <= 0) {
    throw new Error("Age must be a valid positive integer");
  }

  if (
    !fitnessGoal ||
    typeof fitnessGoal !== "string" ||
    !fitnessGoal.trim()
  ) {
    throw new Error("Fitness goal is required");
  }

  if (
    !experienceLevel ||
    typeof experienceLevel !== "string" ||
    !experienceLevel.trim()
  ) {
    throw new Error("Experience level is required");
  }

  const prompt = `
You are the AI fitness recommendation component of AI FitTrack.

Create a personalized workout recommendation using only the information
provided below.

User Information:
- Age: ${parsedAge}
- Fitness Goal: ${fitnessGoal.trim()}
- Experience Level: ${experienceLevel.trim()}

Provide the response with these sections:

1. Personalized Workout Plan
2. Weekly Exercise Suggestions
3. Experience-Level Recommendations
4. Motivational Guidance
5. Safety Tips

Keep the recommendation practical, clear, and appropriate for the user's
stated experience level.

Do not diagnose medical conditions.
Do not claim to replace professional medical advice.
If the supplied information suggests that professional guidance may be
appropriate, state that clearly.
`;

  return generateContent(prompt);
};

const generateFitnessInsights = async (workouts) => {
  if (!Array.isArray(workouts)) {
    throw new Error("Workout history must be an array");
  }

  if (workouts.length === 0) {
    throw new Error(
      "Workout history is required to generate fitness insights"
    );
  }

  const workoutHistory = workouts.map((workout, index) => ({
    workoutNumber: index + 1,
    workoutName: workout.workoutName,
    category: workout.category,
    duration: workout.duration,
    caloriesBurned: workout.caloriesBurned,
    workoutDate: workout.workoutDate,
  }));

  const totalWorkouts = workoutHistory.length;

  const totalDuration = workoutHistory.reduce(
    (sum, workout) => sum + Number(workout.duration || 0),
    0
  );

  const averageWorkoutDuration = Number(
    (totalDuration / totalWorkouts).toFixed(2)
  );

  const totalCaloriesBurned = workoutHistory.reduce(
    (sum, workout) => sum + Number(workout.caloriesBurned || 0),
    0
  );

  const prompt = `
You are the AI fitness insights component of AI FitTrack.

Analyze the authenticated user's fitness activity using the supplied
summary metrics and workout history.

Fitness Summary:
- Total Workouts: ${totalWorkouts}
- Average Workout Duration: ${averageWorkoutDuration} minutes
- Total Calories Burned: ${totalCaloriesBurned}

Workout History:
${JSON.stringify(workoutHistory, null, 2)}

Provide clear and practical fitness insights using these sections:

1. Progress Summary
2. Consistency Analysis
3. Workout Patterns
4. Improvement Suggestions
5. Motivational Feedback

Use the Fitness Summary values as the primary quantitative metrics.

Use Workout History only to support observations about consistency,
workout categories, dates, and patterns.

Base the analysis only on the supplied data.

Do not invent workouts, dates, durations, calories, trends, or progress
that are not supported by the supplied data.

If there is insufficient workout history to establish a trend or
consistency pattern, state that clearly.

Do not diagnose medical conditions.
Do not claim to replace professional medical advice.
`;

  return generateContent(prompt);
};

const generateFitnessChatResponse = async ({
  message,
  goal,
  age,
  heightCm,
  currentWeightKg,
  targetWeightKg,
  experienceLevel,
}) => {
  if (
    !message ||
    typeof message !== "string" ||
    !message.trim()
  ) {
    throw new Error("Message is required");
  }

  const userContext = {
    goal: goal ?? null,
    age: age ?? null,
    heightCm: heightCm ?? null,
    currentWeightKg: currentWeightKg ?? null,
    targetWeightKg: targetWeightKg ?? null,
    experienceLevel: experienceLevel ?? null,
  };

  const prompt = `
You are the AI FitTrack Fitness Assistant.

Your allowed scope is limited to:
- workout recommendations
- fitness insights
- motivational guidance
- fitness safety guidance

User Message:
${message.trim()}

Optional User Context:
${JSON.stringify(userContext, null, 2)}

Instructions:

1. Answer fitness-related requests clearly and practically.
2. Use optional user context only when relevant.
3. Do not invent missing personal information.
4. Do not behave as a general-purpose chatbot.
5. If the request is unrelated to fitness, explain that AI FitTrack can only
   assist with fitness, workouts, fitness progress, motivation, and fitness
   safety.
6. Do not diagnose medical conditions.
7. Do not prescribe medication.
8. Do not claim to replace a healthcare professional.
9. If the user reports concerning symptoms, injuries, or circumstances that
   may require professional care, recommend appropriate professional guidance.
10. Keep workout guidance appropriate to the information supplied.
11. If a fitness request needs personal details for safe or meaningful
    personalization and those details are missing, ask a concise follow-up
    question for the missing details. Do not guess, infer, or invent them.
12. Do not claim access to previous conversations or persistent chat history.
13. Treat this request as stateless; use only the current message and optional
    context included above.
14. Do not claim access to information that was not supplied in this request.

Return only the Fitness Assistant response.
`;

  return generateContent(prompt);
};

module.exports = {
  generateContent,
  generateWorkoutRecommendation,
  generateFitnessInsights,
  generateFitnessChatResponse,
};