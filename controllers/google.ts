import * as dotenv from 'dotenv';
dotenv.config();
import express, { Request, Response } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

const app = express();
const router = express.Router();

const users: { [key: string]: any } = {};

// ResponseHandler Function
export const ResponseHandler = (
  message: string,
  data: any,
  status: number,
  error: boolean,
  res: Response
) => {
  return res.status(status).json({
    message,
    data,
    error,
  });
};

// Ensure environment variables are loaded
const clientID = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!clientID || !clientSecret) {
  throw new Error("Google OAuth credentials are not set in environment variables.");
}

// Initialize Passport strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: clientID,
      clientSecret: clientSecret,
      callbackURL: "http://localhost:8000/api/auth-guardian/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      let user = users[profile.id];
      if (!user) {
        user = {
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails ? profile.emails[0].value : 'Email not available',
          profileUrl: profile.photos ? profile.photos[0].value : 'Profile picture not available',
        };
        users[profile.id] = user;
      }
      return done(null, user);
    }
  )
);

// Serialize and deserialize user
passport.serializeUser((user: any, done) => done(null, user.googleId));
passport.deserializeUser((googleId: string, done) => {
  const user = users[googleId];
  done(null, user || null);
});

// Middleware for Google authentication
export const googleAuth = passport.authenticate('google', { scope: ['profile', 'email'] });

// Updated Google Auth Callback
export const googleAuthCallback = async (req: Request, res: Response) => {
  try {
    const user = req.user as any; // Retrieve the authenticated user from `req.user`
    if (user) {
      return ResponseHandler(
        "Authentication successful",
        {
          googleId: user.googleId,
          name: user.name,
          email: user.email,
          profileUrl: user.profileUrl,
        },
        200,
        false,
        res
      );
    } else {
      return ResponseHandler("Authentication failed", null, 401, true, res);
    }
  } catch (error) {
    console.error(error);
    return ResponseHandler("Something went wrong", error, 500, true, res);
  }
};