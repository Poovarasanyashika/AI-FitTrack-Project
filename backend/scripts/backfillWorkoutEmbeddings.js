const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();

const connectDB = require("../src/config/db");
const Workout = require("../src/models/Workout");
const {
  EMBEDDING_MODEL,
  EMBEDDING_DIMENSIONS,
  generateEmbeddings,
} = require("../src/services/embeddingService");
const {
  buildWorkoutSearchText,
} = require("../src/utils/searchUtils");

const BATCH_SIZE = Math.max(
  1,
  Math.min(
    Number.parseInt(process.env.EMBEDDING_BACKFILL_BATCH_SIZE || "20", 10) || 20,
    100
  )
);

const main = async () => {
  await connectDB();

  const workouts = await Workout.find({})
    .select("+embedding +searchText +embeddingModel +embeddingUpdatedAt")
    .lean();

  console.log(`Found ${workouts.length} workout(s) to inspect.`);

  let updated = 0;

  for (let start = 0; start < workouts.length; start += BATCH_SIZE) {
    const batch = workouts.slice(start, start + BATCH_SIZE);
    const searchTexts = batch.map(buildWorkoutSearchText);
    const embeddings = await generateEmbeddings(searchTexts, {
      taskType: "RETRIEVAL_DOCUMENT",
    });
    const now = new Date();

    const operations = batch.map((workout, index) => ({
      updateOne: {
        filter: { _id: workout._id },
        update: {
          $set: {
            searchText: searchTexts[index],
            embedding: embeddings[index],
            embeddingModel: EMBEDDING_MODEL,
            embeddingUpdatedAt: now,
          },
        },
      },
    }));

    const result = await Workout.bulkWrite(operations, { ordered: false });
    updated += result.modifiedCount + result.upsertedCount;

    console.log(
      `Backfilled ${Math.min(start + batch.length, workouts.length)}/${workouts.length} workout(s) at ${EMBEDDING_DIMENSIONS} dimensions.`
    );
  }

  console.log(
    `Embedding backfill completed. Updated ${updated} workout document(s) with model ${EMBEDDING_MODEL}.`
  );
};

main()
  .catch((error) => {
    console.error(`Embedding backfill failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
