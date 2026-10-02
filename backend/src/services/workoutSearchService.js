const Workout = require("../models/Workout");

const {
  EMBEDDING_MODEL,
  EMBEDDING_DIMENSIONS,
  generateEmbeddings,
  generateQueryEmbedding,
} = require("./embeddingService");

const ATLAS_SEARCH_INDEX =
  process.env.ATLAS_SEARCH_INDEX || "workout_text_search";

const ATLAS_VECTOR_INDEX =
  process.env.ATLAS_VECTOR_INDEX || "workout_vector_search";

const toBoolean = (value) =>
  ["1", "true", "yes", "on"].includes(
    String(value || "").trim().toLowerCase()
  );

const isAtlasSearchEnabled = () =>
  toBoolean(process.env.ATLAS_SEARCH_ENABLED);

const isAtlasVectorSearchEnabled = () =>
  toBoolean(process.env.ATLAS_VECTOR_SEARCH_ENABLED);

const {
  sanitizeLimit,
  buildWorkoutSearchText,
  rankWorkoutsByEmbedding,
} = require("../utils/searchUtils");

const writeSearchMetadata = async (workoutId, searchText, embedding) => {
  const update = {
    searchText,
  };

  if (embedding) {
    update.embedding = embedding;
    update.embeddingModel = EMBEDDING_MODEL;
    update.embeddingUpdatedAt = new Date();
  }

  await Workout.updateOne(
    { _id: workoutId },
    {
      $set: update,
    }
  );
};

const refreshWorkoutSearchMetadata = async (workout) => {
  const searchText = buildWorkoutSearchText(workout);

  try {
    const [embedding] = await generateEmbeddings([searchText], {
      taskType: "RETRIEVAL_DOCUMENT",
    });

    await writeSearchMetadata(workout._id, searchText, embedding);

    return {
      searchText,
      embeddingUpdated: true,
    };
  } catch (error) {
    // Core workout CRUD must remain available if the external embedding
    // provider is temporarily unavailable. Persist lexical metadata and
    // allow the backfill utility to repair embeddings later.
    await writeSearchMetadata(workout._id, searchText, null);

    console.warn(
      `Workout embedding refresh skipped for ${workout._id}: ${error.message}`
    );

    return {
      searchText,
      embeddingUpdated: false,
      warning: error.message,
    };
  }
};

const ensureWorkoutEmbeddings = async (workouts) => {
  const missing = workouts.filter(
    (workout) =>
      !Array.isArray(workout.embedding) ||
      workout.embedding.length !== EMBEDDING_DIMENSIONS ||
      workout.embeddingModel !== EMBEDDING_MODEL
  );

  if (missing.length === 0) {
    return workouts;
  }

  const searchTexts = missing.map((workout) =>
    buildWorkoutSearchText(workout)
  );

  const embeddings = await generateEmbeddings(searchTexts, {
    taskType: "RETRIEVAL_DOCUMENT",
  });

  const operations = missing.map((workout, index) => {
    const searchText = searchTexts[index];
    const embedding = embeddings[index];

    workout.searchText = searchText;
    workout.embedding = embedding;
    workout.embeddingModel = EMBEDDING_MODEL;
    workout.embeddingUpdatedAt = new Date();

    return {
      updateOne: {
        filter: { _id: workout._id },
        update: {
          $set: {
            searchText,
            embedding,
            embeddingModel: EMBEDDING_MODEL,
            embeddingUpdatedAt: workout.embeddingUpdatedAt,
          },
        },
      },
    };
  });

  if (operations.length > 0) {
    await Workout.bulkWrite(operations, { ordered: false });
  }

  return workouts;
};

const semanticSearchLocal = async ({ userId, query, limit = 10 }) => {
  const safeLimit = sanitizeLimit(limit);

  const workouts = await Workout.find({ user: userId })
    .select("+embedding +searchText +embeddingModel +embeddingUpdatedAt")
    .lean();

  if (workouts.length === 0) {
    return [];
  }

  await ensureWorkoutEmbeddings(workouts);

  const queryEmbedding = await generateQueryEmbedding(query);
  const ranked = rankWorkoutsByEmbedding(workouts, queryEmbedding, safeLimit);

  return ranked.map(({ workout, score }) => {
    const {
      embedding,
      embeddingModel,
      embeddingUpdatedAt,
      searchText,
      ...safeWorkout
    } = workout;

    return {
      ...safeWorkout,
      searchScore: Number(score.toFixed(6)),
      searchMode: "semantic-local",
    };
  });
};

const atlasTextSearch = async ({ userId, query, limit = 10 }) => {
  if (!isAtlasSearchEnabled()) {
    const error = new Error(
      "MongoDB Atlas Search is not enabled. Set ATLAS_SEARCH_ENABLED=true after configuring the Atlas Search index."
    );
    error.statusCode = 503;
    throw error;
  }

  const safeLimit = sanitizeLimit(limit);

  return Workout.aggregate([
    {
      $search: {
        index: ATLAS_SEARCH_INDEX,
        compound: {
          filter: [
            {
              equals: {
                path: "user",
                value: userId,
              },
            },
          ],
          must: [
            {
              text: {
                query,
                path: ["workoutName", "category", "searchText"],
                fuzzy: {
                  maxEdits: 1,
                },
              },
            },
          ],
        },
      },
    },
    {
      $limit: safeLimit,
    },
    {
      $project: {
        user: 1,
        workoutName: 1,
        category: 1,
        duration: 1,
        caloriesBurned: 1,
        workoutDate: 1,
        createdAt: 1,
        updatedAt: 1,
        searchScore: { $meta: "searchScore" },
        searchMode: { $literal: "atlas-search" },
      },
    },
  ]);
};

const atlasVectorSearch = async ({ userId, query, limit = 10 }) => {
  if (!isAtlasVectorSearchEnabled()) {
    const error = new Error(
      "MongoDB Atlas Vector Search is not enabled. Set ATLAS_VECTOR_SEARCH_ENABLED=true after configuring the vector index."
    );
    error.statusCode = 503;
    throw error;
  }

  const safeLimit = sanitizeLimit(limit);
  const queryEmbedding = await generateQueryEmbedding(query);
  const numCandidates = Math.max(safeLimit * 10, 100);

  return Workout.aggregate([
    {
      $vectorSearch: {
        index: ATLAS_VECTOR_INDEX,
        path: "embedding",
        queryVector: queryEmbedding,
        numCandidates,
        limit: safeLimit,
        filter: {
          user: userId,
        },
      },
    },
    {
      $project: {
        user: 1,
        workoutName: 1,
        category: 1,
        duration: 1,
        caloriesBurned: 1,
        workoutDate: 1,
        createdAt: 1,
        updatedAt: 1,
        searchScore: { $meta: "vectorSearchScore" },
        searchMode: { $literal: "atlas-vector" },
      },
    },
  ]);
};

const semanticSearch = async ({
  userId,
  query,
  limit = 10,
  provider = "auto",
}) => {
  const normalizedProvider = String(provider || "auto").toLowerCase();

  if (normalizedProvider === "atlas") {
    return atlasVectorSearch({ userId, query, limit });
  }

  if (normalizedProvider === "local") {
    return semanticSearchLocal({ userId, query, limit });
  }

  if (normalizedProvider !== "auto") {
    const error = new Error("provider must be auto, local, or atlas");
    error.statusCode = 400;
    throw error;
  }

  if (isAtlasVectorSearchEnabled()) {
    return atlasVectorSearch({ userId, query, limit });
  }

  return semanticSearchLocal({ userId, query, limit });
};

module.exports = {
  ATLAS_SEARCH_INDEX,
  ATLAS_VECTOR_INDEX,
  refreshWorkoutSearchMetadata,
  semanticSearchLocal,
  atlasTextSearch,
  atlasVectorSearch,
  semanticSearch,
  sanitizeLimit,
  isAtlasSearchEnabled,
  isAtlasVectorSearchEnabled,
};
