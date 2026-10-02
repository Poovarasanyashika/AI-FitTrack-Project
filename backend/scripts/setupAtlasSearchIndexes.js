const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();

const connectDB = require("../src/config/db");
const Workout = require("../src/models/Workout");
const { EMBEDDING_DIMENSIONS } = require("../src/services/embeddingService");
const {
  ATLAS_SEARCH_INDEX,
  ATLAS_VECTOR_INDEX,
} = require("../src/services/workoutSearchService");

const upsertSearchIndex = async (collection, index) => {
  const existing = await collection.listSearchIndexes().toArray();
  const found = existing.find((item) => item.name === index.name);

  if (found) {
    await collection.updateSearchIndex(index.name, index.definition);
    console.log(`Updated search index: ${index.name}`);
    return;
  }

  await collection.createSearchIndex(index);
  console.log(`Created search index: ${index.name}`);
};

const main = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required");
  }

  await connectDB();
  const collection = Workout.collection;

  await upsertSearchIndex(collection, {
    name: ATLAS_SEARCH_INDEX,
    type: "search",
    definition: {
      mappings: {
        dynamic: false,
        fields: {
          user: { type: "objectId" },
          workoutName: { type: "string" },
          category: { type: "string" },
          searchText: { type: "string" },
          workoutDate: { type: "date" },
        },
      },
    },
  });

  await upsertSearchIndex(collection, {
    name: ATLAS_VECTOR_INDEX,
    type: "vectorSearch",
    definition: {
      fields: [
        {
          type: "vector",
          path: "embedding",
          numDimensions: EMBEDDING_DIMENSIONS,
          similarity: "cosine",
        },
        {
          type: "filter",
          path: "user",
        },
      ],
    },
  });

  console.log(
    "Index creation/update requested. Atlas builds Search and Vector Search indexes asynchronously; check index status before enabling runtime flags."
  );
};

main()
  .catch((error) => {
    console.error(`Atlas Search index setup failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
