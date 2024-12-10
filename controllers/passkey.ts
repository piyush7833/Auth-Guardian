import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import { Request, Response } from "express";
import {
  getUserByEmail,
  createUser,
  getUserById,
  updateUserCounter,
} from "../db/db";

declare module "express-session" {
  interface SessionData {
    challenge: string;
    userId: string;
    email: string;
  }
}

// const CLIENT_URL = "http://localhost:5173";
const CLIENT_URL = "http://localhost:5173";
const RP_ID = "localhost";

export const passkeyRegisterInit = async (req: Request, res: Response) => {
  const email = req.query.email;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  if (getUserByEmail(email as string) != null) {
    return res.status(400).json({ error: "User already exists" });
  }

  const options = await generateRegistrationOptions({
    rpID: RP_ID,
    rpName: "Auth Guardian",
    userName: email as string,
  });

  // Store challenge in session
  req.session.userId = options.user.id;
  req.session.email = email as string;
  req.session.challenge = options.challenge;

  res.json({ options });
};

export const passkeyVerifyRegister = async (req: Request, res: Response) => {
  const { registrationJSON } = req.body;

  if (!req.session.challenge) {
    return res.status(400).json({ error: "Challenge not found in session" });
  }

  try {
    const verification = await verifyRegistrationResponse({
      response: registrationJSON,
      expectedChallenge: req.session.challenge, // Retrieve the stored challenge
      expectedOrigin: CLIENT_URL,
      expectedRPID: RP_ID,
    });
    if (verification.verified && verification.registrationInfo) {
      createUser(
        req.session.userId as string,
        req.session.email as string,
        {
          id: verification.registrationInfo.credentialID,
          publicKey: verification.registrationInfo.credentialPublicKey,
          counter: verification.registrationInfo.counter,
          deviceType: verification.registrationInfo.credentialDeviceType,
          backedUp: verification.registrationInfo.credentialBackedUp,
          transport: req.body.transports,
        }
      );

      return res.json({ verified: verification.verified });
    } else {
      return res
        .status(400)
        .json({ verified: false, error: "Verification failed" });
    }
  } catch (error) {
    console.error("Verification error:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

export const passkeyAuthInit = async (req: Request, res: Response) => {
  const email = req.query.email;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const user = getUserByEmail(email as string);
  if (user == null) {
    return res.status(400).json({ error: "No user for this email" });
  }

  const options = await generateAuthenticationOptions({
    rpID: RP_ID,
    allowCredentials: [
      {
        id: user.passKey.id,
        transports: user.passKey.transports,
      },
    ],
  });

  // Store challenge in session
  req.session.challenge = options.challenge;

  res.json(options);
};

export const passkeyAuthVerify = async (req: Request, res: Response) => {
  if (!req.session.challenge) {
    return res.status(400).json({ error: "Authentication challenge not found" });
  }

  const { id } = req.body;
  const userId = req.session.userId;
  if (!userId) {
    return res.status(400).json({ error: "User ID not found in session" });
  }
  const user = getUserById(userId);

  if (user == null || user.passKey.id !== id) {
    return res.status(400).json({ error: "Invalid user" });
  }

  const verification = await verifyAuthenticationResponse({
    response: req.body,
    expectedChallenge: req.session.challenge,
    expectedOrigin: CLIENT_URL,
    expectedRPID: RP_ID,
    authenticator: {
      credentialID: user.passKey.id,
      credentialPublicKey: user.passKey.publicKey,
      counter: user.passKey.counter,
      transports: user.passKey.transports,
    },
  });

  if (verification.verified) {
    updateUserCounter(user.id, verification.authenticationInfo.newCounter);
    req.session.challenge = undefined; // Clear the challenge after use
    return res.json({ verified: verification.verified });
  } else {
    return res.status(400).json({ verified: false, error: "Verification failed" });
  }
};
