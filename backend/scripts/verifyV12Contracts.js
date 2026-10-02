const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const backendRoot = path.resolve(__dirname, "..");
const projectRoot = path.resolve(backendRoot, "..");
const frontendRoot = path.join(projectRoot, "frontend");

const read = (file) =>
  fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "");

const backend = (relative) => read(path.join(backendRoot, relative));
const frontend = (relative) => read(path.join(frontendRoot, relative));

const checks = [];
const check = (name, fn) => {
  fn();
  checks.push(name);
  console.log(`PASS: ${name}`);
};


check("Auth contract exposes register/login/profile with protected profile", () => {
  const routes = backend("src/routes/authRoutes.js");
  const token = backend("src/utils/generateToken.js");
  assert.match(routes, /router\.post\("\/register", registerUser\)/);
  assert.match(routes, /router\.post\("\/login", loginUser\)/);
  assert.match(routes, /router\.get\("\/profile", protect, getProfile\)/);
  assert.match(token, /jwt\.sign/);
  assert.match(token, /userId/);
});

check("Workout CRUD + search contract is present and authenticated", () => {
  const source = backend("src/routes/workoutRoutes.js");
  assert.match(source, /router\.use\(protect\)/);
  assert.match(source, /\.post\(createWorkout\)/);
  assert.match(source, /\.get\(getWorkouts\)/);
  assert.match(source, /router\.get\("\/search", searchWorkouts\)/);
  assert.match(source, /\.get\(getWorkoutById\)/);
  assert.match(source, /\.put\(updateWorkout\)/);
  assert.match(source, /\.delete\(deleteWorkout\)/);
});

check("Gemini recommendation and fitness insights flows are wired", () => {
  const routes = backend("src/routes/aiRoutes.js");
  const controller = backend("src/controllers/aiController.js");
  const service = backend("src/services/geminiService.js");
  assert.ok(routes.includes("/workout-recommendation"));
  assert.ok(routes.includes("/fitness-insights"));
  assert.match(routes, /protect/);
  assert.match(controller, /generateWorkoutRecommendation/);
  assert.match(controller, /generateFitnessInsights/);
  assert.match(service, /return generateContent\(prompt\)/);
});

check("Admin routes are JWT + admin protected", () => {
  const source = backend("src/routes/adminRoutes.js");
  assert.match(source, /router\.use\(protect, requireAdmin\)/);
});

check("Admin API surface matches BA-AIFT-001 v1.2", () => {
  const source = backend("src/routes/adminRoutes.js");
  for (const route of [
    "/dashboard",
    "/users",
    "/workouts",
    "/reports",
    "/system-health",
  ]) {
    assert.match(source, new RegExp(`router\\.get\\(\\"${route.replace("/", "\\/")}`));
  }
  for (const legacy of ["/overview", "/analytics/workouts", "/analytics/users", "/users/:id"]) {
    assert.ok(!source.includes(legacy), `Legacy/unapproved route present: ${legacy}`);
  }
  assert.ok(!/router\.(post|put|patch|delete)\(/.test(source));
});

check("Normal registration cannot escalate role", () => {
  const source = backend("src/controllers/authController.js");
  assert.match(source, /role:\s*"user"/);
  assert.ok(!/const\s*\{[^}]*\brole\b[^}]*\}\s*=\s*req\.body/s.test(source));
});

check("Password hashes are excluded by the model and serializers", () => {
  const model = backend("src/models/User.js");
  const auth = backend("src/controllers/authController.js");
  const admin = backend("src/controllers/adminController.js");
  assert.match(model, /select:\s*false/);
  assert.ok(!/password:\s*user\.password/.test(auth));
  assert.ok(!/password:\s*user\.password/.test(admin));
});

check("Workout APIs require authentication", () => {
  const source = backend("src/routes/workoutRoutes.js");
  assert.match(source, /router\.use\(protect\)/);
  for (const method of ["post", "get", "put", "delete"]) {
    assert.ok(source.includes(`.${method}(`) || source.includes(`router.${method}(`));
  }
});

check("Chatbot endpoint requires JWT and supports approved context", () => {
  const route = backend("src/routes/chatbotRoutes.js");
  const controller = backend("src/controllers/aiController.js");
  assert.match(route, /router\.post\("\/", protect, fitnessChat\)/);
  for (const field of [
    "message",
    "goal",
    "age",
    "heightCm",
    "currentWeightKg",
    "targetWeightKg",
    "experienceLevel",
  ]) {
    assert.ok(controller.includes(field), `Chatbot field missing: ${field}`);
  }
});

check("Chatbot is fitness-only, stateless, and requests missing details", () => {
  const source = backend("src/services/geminiService.js");
  assert.match(source, /allowed scope is limited to/i);
  assert.match(source, /Do not behave as a general-purpose chatbot/i);
  assert.match(source, /ask a concise follow-up\s+question/i);
  assert.match(source, /Do not guess, infer, or invent/i);
  assert.match(source, /stateless/i);
  assert.match(source, /persistent chat history/i);
});

check("Sensitive configuration is not returned by admin APIs", () => {
  const source = backend("src/controllers/adminController.js");
  for (const forbidden of ["JWT_SECRET", "GEMINI_API_KEY", "MONGO_URI", "process.env"]) {
    assert.ok(!source.includes(forbidden), `Sensitive config reference in admin controller: ${forbidden}`);
  }
});

check("Frontend admin service uses only approved v1.2 APIs", () => {
  const source = frontend("src/services/adminService.js");
  for (const route of [
    "/admin/dashboard",
    "/admin/users",
    "/admin/workouts",
    "/admin/reports",
    "/admin/system-health",
  ]) {
    assert.ok(source.includes(route));
  }
  for (const legacy of ["/admin/overview", "/admin/analytics/workouts", "/admin/analytics/users"]) {
    assert.ok(!source.includes(legacy));
  }
});

check("Frontend route guards separate user and admin navigation", () => {
  const source = frontend("src/App.jsx");
  assert.match(source, /function RequireUser\(\)/);
  assert.match(source, /function RequireAdmin\(\)/);
  assert.match(source, /user\?\.role === "admin"/);
  assert.match(source, /user\?\.role !== "admin"/);
  assert.match(source, /to="\/admin\?tab=overview"/);
  assert.match(source, /to="\/dashboard"/);
});

check("Frontend chatbot client forwards only approved optional context fields", () => {
  const source = frontend("src/services/chatbotService.js");
  for (const field of [
    "goal",
    "age",
    "heightCm",
    "currentWeightKg",
    "targetWeightKg",
    "experienceLevel",
  ]) {
    assert.ok(source.includes(`"${field}"`));
  }
});

console.log(`\n${checks.length} BA-AIFT-001 v1.2 contract checks passed.`);
