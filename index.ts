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
];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin
      // (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        var msg =
          "The CORS policy for this site does not " +
          "allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
  })
);


console.log(process.env.Twitter_Client_ID);
console.log(process.env.Twitter_Client_Secret);
console.log(process.env.Twitter_Callback_URL);

// Initialize Passport and session
app.use(passport.initialize());
app.use(passport.session());
app.use("/api/auth-guardian", routes);

app.listen(8000, () => {
  console.log("Connected to Server");
});
