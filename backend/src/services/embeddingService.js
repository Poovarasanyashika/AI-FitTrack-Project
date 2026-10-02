const { GoogleGenAI } = require("@google/genai");

const EMBEDDING_MODEL =
  process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-001";

const EMBEDDING_DIMENSIONS = Number.parseInt(
  process.env.GEMINI_EMBEDDING_DIMENSIONS || "768",
  10
);

const getGeminiClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  if (
    !Number.isInteger(EMBEDDING_DIMENSIONS) ||
    EMBEDDING_DIMENSIONS < 128 ||
    EMBEDDING_DIMENSIONS > 3072
  ) {
    throw new Error(
      "GEMINI_EMBEDDING_DIMENSIONS must be an integer between 128 and 3072"
    );
  }

  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
};

const validateText = (text) => {
  if (!text || typeof text !== "string" || !text.trim()) {
    throw new Error("Embedding text is required");
  }

  return text.trim();
};

const validateVector = (values) => {
  if (!Array.isArray(values) || values.length !== EMBEDDING_DIMENSIONS) {
    throw new Error(
      `Embedding response must contain ${EMBEDDING_DIMENSIONS} dimensions`
    );
  }

  if (values.some((value) => !Number.isFinite(Number(value)))) {
    throw new Error("Embedding response contains a non-numeric value");
  }

  return values.map(Number);
};

const generateEmbeddings = async (
  texts,
  { taskType = "RETRIEVAL_DOCUMENT" } = {}
) => {
  if (!Array.isArray(texts) || texts.length === 0) {
    throw new Error("At least one embedding text is required");
  }

  const normalizedTexts = texts.map(validateText);
  const ai = getGeminiClient();

  const response = await ai.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: normalizedTexts,
    config: {
      taskType,
      outputDimensionality: EMBEDDING_DIMENSIONS,
    },
  });

  if (
    !Array.isArray(response.embeddings) ||
    response.embeddings.length !== normalizedTexts.length
  ) {
    throw new Error("Gemini returned an unexpected embedding response");
  }

  return response.embeddings.map((embedding) =>
    validateVector(embedding?.values)
  );
};

const generateDocumentEmbedding = async (text) => {
  const [embedding] = await generateEmbeddings([text], {
    taskType: "RETRIEVAL_DOCUMENT",
  });

  return embedding;
};

const generateQueryEmbedding = async (text) => {
  const [embedding] = await generateEmbeddings([text], {
    taskType: "RETRIEVAL_QUERY",
  });

  return embedding;
};

module.exports = {
  EMBEDDING_MODEL,
  EMBEDDING_DIMENSIONS,
  generateEmbeddings,
  generateDocumentEmbedding,
  generateQueryEmbedding,
};
