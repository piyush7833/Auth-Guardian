import passport from "passport";
import { ResponseHandler } from "../helpers/response.helper";
import { Request, Response } from "express";
import { Strategy as TwitterStrategy } from "passport-twitter";


passport.use(
  new TwitterStrategy(
    {
      consumerKey: process.env.TWITTER_CLIENT_ID as string,
      consumerSecret: process.env.TWITTER_CLIENT_SECRET as string,
      callbackURL: process.env.TWITTER_CALLBACK_URL as string,
      includeEmail: true,
    },
    function (token: string, tokenSecret: string, profile: any, done: any) {
      try {
        const userData = {
          userName: profile.username,
          name: profile.displayName,
          phone:profile.phone || null,
          email: profile.emails?.[0]?.value || null,
          avatar: profile.photos?.[0]?.value || null,
        };

        return done(null, userData);
      } catch (error) {
        console.error("Error in Twitter strategy:", error);
        return done(error, null);
      }
    }
  )
);


// Serialize and Deserialize User
passport.serializeUser((user: any, done) => {
  done(null, user);
});

passport.deserializeUser((user: any, done) => {
  done(null, user);
});

// Route to start Twitter Authentication
export const twitterAuth = passport.authenticate("twitter");

// Route to handle Twitter Authentication Callback
export const twitterAuthCallback = (req: Request, res: Response) => {
  passport.authenticate(
    "twitter",
    { failureRedirect: "/login" },
    (err:any, user:any, info:any) => {
      if (err) {
        console.error("Twitter Callback Error:", err);
        return ResponseHandler("Authentication failed", null, 500, true, res);
      }
      if (!user) {
        return ResponseHandler("No user data returned", null, 401, true, res);
      }

      // Set user session or token if needed
      req.logIn(user, (loginErr) => {
        if (loginErr) {
          console.error("Login Error:", loginErr);
          return ResponseHandler("Login failed", null, 500, true, res);
        }
        return ResponseHandler("Twitter Authentication Successful", user, 200, false, res);
      }); 
    }
  )(req, res);
};
