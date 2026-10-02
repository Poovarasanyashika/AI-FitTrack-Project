const express = require(
  "express"
);

const cors = require(
  "cors"
);


const authRoutes =
  require(
    "./routes/authRoutes"
  );

const workoutRoutes =
  require(
    "./routes/workoutRoutes"
  );

const aiRoutes =
  require(
    "./routes/aiRoutes"
  );

const chatbotRoutes =
  require(
    "./routes/chatbotRoutes"
  );

const adminRoutes =
  require(
    "./routes/adminRoutes"
  );


const {
  errorHandler,
} = require(
  "./middleware/errorMiddleware"
);


const app =
  express();


// Global middleware
app.use(cors());

app.use(
  express.json()
);

app.use(
  express.urlencoded({
    extended: true,
  })
);


// Health check
app.get(
  "/api/health",
  (req, res) => {
    res.status(200).json({
      success: true,

      message:
        "AI FitTrack API is running",
    });
  }
);


// API routes
app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/workouts",
  workoutRoutes
);

app.use(
  "/api/ai",
  aiRoutes
);

app.use(
  "/api/chatbot",
  chatbotRoutes
);

app.use(
  "/api/admin",
  adminRoutes
);


// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,

    message:
      "Route not found",

    error: {
      code:
        "ROUTE_NOT_FOUND",
    },
  });
});


// Central error handler
// must remain last
app.use(errorHandler);


module.exports = app;