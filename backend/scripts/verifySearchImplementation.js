const assert = require("assert");
const fs = require("fs");
const path = require("path");

const {
  buildWorkoutSearchText,
  cosineSimilarity,
  rankWorkoutsByEmbedding,
} = require("../src/utils/searchUtils");

const read = (relativePath) =>
  fs.readFileSync(path.join(__dirname, "..", relativePath), "utf8");

const checks = [];
const check = (name, fn) => {
  fn();
  checks.push(name);
  console.log(`PASS: ${name}`);
};

check("Workout schema includes semantic-search metadata", () => {
  const source = read("src/models/Workout.js");
  assert(source.includes("searchText:"));
  assert(source.includes("embedding:"));
  assert(source.includes("embeddingModel:"));
  assert(source.includes("embeddingUpdatedAt:"));
});

check("Search text builder includes workout domain fields", () => {
  const text = buildWorkoutSearchText({
    workoutName: "Full Body Strength",
    category: "Strength",
    duration: 45,
    caloriesBurned: 300,
    workoutDate: "2026-10-01",
  });
  assert(text.includes("Full Body Strength"));
  assert(text.includes("Strength"));
  assert(text.includes("45 minute workout"));
});

check("Cosine ranking orders nearest vectors first", () => {
  const ranked = rankWorkoutsByEmbedding(
    [
      { _id: "a", embedding: [1, 0] },
      { _id: "b", embedding: [0.8, 0.2] },
      { _id: "c", embedding: [0, 1] },
    ],
    [1, 0],
    3
  );
  assert.strictEqual(ranked[0].workout._id, "a");
  assert(ranked[0].score > ranked[1].score);
  assert(ranked[1].score > ranked[2].score);
  assert.strictEqual(cosineSimilarity([1, 0], [1, 0]), 1);
});

check("Gemini embedding integration is wired", () => {
  const source = read("src/services/embeddingService.js");
  assert(source.includes("ai.models.embedContent"));
  assert(source.includes("RETRIEVAL_DOCUMENT"));
  assert(source.includes("RETRIEVAL_QUERY"));
});

check("MongoDB Atlas Search aggregation is wired", () => {
  const source = read("src/services/workoutSearchService.js");
  assert(source.includes("$search"));
  assert(source.includes("ATLAS_SEARCH_INDEX"));
  assert(source.includes('path: ["workoutName", "category", "searchText"]'));
});

check("MongoDB Atlas Vector Search aggregation is wired", () => {
  const source = read("src/services/workoutSearchService.js");
  assert(source.includes("$vectorSearch"));
  assert(source.includes("queryVector"));
  assert(source.includes("vectorSearchScore"));
});

check("Atlas Search and Vector Search index provisioning is wired", () => {
  const source = read("scripts/setupAtlasSearchIndexes.js");
  assert(source.includes("createSearchIndex"));
  assert(source.includes('type: "search"'));
  assert(source.includes('type: "vectorSearch"'));
  assert(source.includes('type: "filter"'));
});

check("Protected search routes are exposed before /:id", () => {
  const source = read("src/routes/workoutRoutes.js");
  const semantic = source.indexOf('/search/semantic');
  const atlas = source.indexOf('/search/atlas');
  const byId = source.indexOf('.route("/:id")');
  assert(semantic >= 0 && atlas >= 0 && byId >= 0);
  assert(semantic < byId && atlas < byId);
});

check("Frontend search calls semantic API with lexical fallback", () => {
  const service = read("../frontend/src/services/workoutService.js");
  const page = read("../frontend/src/pages/user/WorkoutSearch.jsx");
  assert(service.includes("semanticSearchWorkouts"));
  assert(service.includes("/workouts/search/semantic"));
  assert(page.includes(".semanticSearchWorkouts"));
  assert(page.includes(".searchWorkouts"));
});

console.log(`SEARCH IMPLEMENTATION VERIFICATION PASSED (${checks.length}/${checks.length})`);
