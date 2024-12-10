import express from "express";
import passport from 'passport';

import { googleAuth, googleAuthCallback } from "../controllers/google";
import { facebookAuth } from "../controllers/facebook";
import { twitterAuth, twitterAuthCallback } from "../controllers/twitter";
import { githubAuth, githubAuthCallback } from "../controllers/github";
import { linkedinAuth } from "../controllers/linkedin";
import { microsoftAuth } from "../controllers/microsoft";
import { metamaskAuth } from "../controllers/metamask";
import { appleAuth } from "../controllers/apple";
import {  passkeyAuthInit, passkeyAuthVerify, passkeyRegisterInit, passkeyVerifyRegister } from "../controllers/passkey";
import { test } from "../controllers/test";

const router = express.Router();

router.post("/test",test)
router.get('/google', googleAuth);

// Google OAuth callback route (should match the callbackURL in the GoogleStrategy)
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), googleAuthCallback);



router.post("/facebook", facebookAuth); 

router.get("/twitter", twitterAuth);
router.get("/twitter/callback", twitterAuthCallback);

router.get("/github", githubAuth);
router.get("/github/callback", githubAuthCallback);

router.get("/linkedin", linkedinAuth);

router.post("/microsoft", microsoftAuth);

router.post("/apple", appleAuth);

router.post("/metamask",metamaskAuth);

router.get("/init-register", passkeyRegisterInit);
router.post("/verify-register", passkeyVerifyRegister);
router.get("/init-auth", passkeyAuthInit);
router.post("/verify-auth", passkeyAuthVerify);


export default router;
