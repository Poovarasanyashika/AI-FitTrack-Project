import { apiRequest } from "./api";

const ALLOWED_CONTEXT_FIELDS = [
  "goal",
  "age",
  "heightCm",
  "currentWeightKg",
  "targetWeightKg",
  "experienceLevel",
];

const sendMessage = (message, context = {}) => {
  const body = {
    message,
  };

  ALLOWED_CONTEXT_FIELDS.forEach((field) => {
    if (context[field] !== undefined) {
      body[field] = context[field];
    }
  });

  return apiRequest("/chatbot", {
    method: "POST",
    body,
  });
};

export const chatbotService = {
  sendMessage,
};
