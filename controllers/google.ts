import * as dotenv from 'dotenv';
dotenv.config();

import { Request, Response } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { ResponseHandler } from "../helpers/response.helper";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,    
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: "http://localhost:8000/google/callback",
    },
    (accessToken: string, refreshToken: string, profile: any, done: Function) => {
      const data = {
        name: profile.displayName,
        email: profile.emails[0].value,
        phone: profile.phone,
        avatar: profile.photos[0].value,
      };
      return done(null, profile); 
    }
  )
);

// Serialize and deserialize user to maintain session
passport.serializeUser((user: any, done: Function) => done(null, user));
passport.deserializeUser((user: any, done: Function) => done(null, user));

export const googleAuth = passport.authenticate('google', { scope: ['profile', 'email'] });

export const googleAuthCallback = async (req: Request, res: Response) => {
  try {
    console.log("Here")
    res.redirect('http://localhost:5500/public/index.html');
    // return ResponseHandler("Google Authenticated successfully", req.user, 200, false, res);
  } catch (error) {
    return ResponseHandler("Something went wrong", null, 500, true, res);
  }
};

// Middleware to protect routes (optional)
// export const isAuthenticated = (req: Request, res: Response, next: Function) => {
//   if (req.isAuthenticated()) {
//     return next();
//   }
//   res.redirect('/login');
// };
