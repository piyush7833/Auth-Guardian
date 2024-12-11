import express from "express";
import passport from 'passport';

import { googleAuth, googleAuthCallback } from "../controllers/google";
import { facebookAuth,facebookAuthCallback } from "../controllers/facebook";
import { twitterAuth, twitterAuthCallback } from "../controllers/twitter";
import { githubAuth, githubAuthCallback } from "../controllers/github";
import { linkedinAuth } from "../controllers/linkedin";
import { microsoftAuth } from "../controllers/microsoft";
import { metamaskAuth } from "../controllers/metamask";
import { appleAuth } from "../controllers/apple";
import {  passkeyAuthInit, passkeyAuthVerify, passkeyRegisterInit, passkeyVerifyRegister } from "../controllers/passkey";

const router = express.Router();

router.get('/auth/google', googleAuth);

router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), googleAuthCallback);

router.get('/auth/facebook', facebookAuth);
router.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), facebookAuthCallback); 


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
