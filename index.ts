import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import routes from "./routes/routes";

const app = express();

// Define the allowed origins
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:5500",
  "http://localhost:5500",
  "http://localhost:5173", // Correct origin without trailing slash
];

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(
  session({
    secret: "secret", // Replace with an environment variable in production
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set to true if using HTTPS
  })
);

// CORS middleware
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
    },
    credentials: true, // Include cookies in CORS requests
  })
);

// Initialize Passport and session
app.use(passport.initialize());
app.use(passport.session());

// Define your routes
app.use("/api/auth-guardian", routes);

// Start the server
const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
