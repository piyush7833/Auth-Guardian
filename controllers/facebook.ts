import * as dotenv from 'dotenv';
dotenv.config();
import express, { Request, Response } from 'express';
import passport from 'passport';
import { Strategy as FacebookStrategy } from 'passport-facebook';

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
const facebookAppID = process.env.FACEBOOK_APP_ID;
const facebookAppSecret = process.env.FACEBOOK_APP_SECRET;

if (!facebookAppID || !facebookAppSecret) {
  throw new Error("Facebook OAuth credentials are not set in environment variables.");
}

// Initialize Passport strategy for Facebook
passport.use(
  new FacebookStrategy(
    {
      clientID: facebookAppID,
      clientSecret: facebookAppSecret,
      callbackURL: "http://localhost:8000/api/auth-guardian/auth/facebook/callback",
      profileFields: ['id', 'displayName', 'email', 'picture.type(large)'], // Request email and profile picture
    },
    (accessToken, refreshToken, profile, done) => {
      let user = users[profile.id];
      if (!user) {
        user = {
          facebookId: profile.id,
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
passport.serializeUser((user: any, done) => done(null, user.facebookId));
passport.deserializeUser((facebookId: string, done) => {
  const user = users[facebookId];
  done(null, user || null);
});

// Middleware for Facebook authentication
export const facebookAuth = passport.authenticate('facebook', { scope: ['email'] });

// Updated Callback for Facebook authentication
export const facebookAuthCallback = async (req: Request, res: Response) => {
  try {
    const user = req.user as any; // Retrieve the authenticated user from `req.user`
    if (user) {
      return ResponseHandler(
        "Authentication successful",
        {
          facebookId: user.facebookId,
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