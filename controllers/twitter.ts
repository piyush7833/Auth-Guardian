import passport from "passport";
import { ResponseHandler } from "../helpers/response.helper";
import { Request, Response } from "express";
import { Strategy as TwitterStrategy } from "passport-twitter";

// Configure Passport Twitter Strategy
passport.use(
    new TwitterStrategy(
        {
            consumerKey: process.env.TWITTER_CLIENT_ID as string,
            consumerSecret: process.env.TWITTER_CLIENT_SECRET as string,
            callbackURL: process.env.TWITTER_CALLBACK_URL as string,
            includeEmail: true, // Ensures email is returned
        },
        function (token: string, tokenSecret: string, profile: any, done: any) {
      try {
        const userData = {
          name: profile.displayName,
          email: profile.emails?.[0]?.value || null, // Handles cases where email might not exist
          avatar: profile.photos?.[0]?.value || null,
        };

        console.log("Twitter Profile Data:", userData);
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

        console.log("Twitter Authentication Successful", user);
        res.redirect("/"); // Redirect to your desired route
      });
    }
  )(req, res);
};
