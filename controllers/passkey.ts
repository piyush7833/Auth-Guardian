import { ResponseHandler } from "../helpers/response.helper";
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";
import { Request, Response } from "express";
import { userStore } from "./test";

const challengeStore: any = {};
const loginChallengeStore: any = {};
export const passkeyAuth = async (req: Request, res: Response) => {
  try {
    return ResponseHandler(
      "Google Authenticated successfully",
      null,
      200,
      false,
      res
    );
  } catch (error) {
    return ResponseHandler("Something went wrong", null, 500, true, res);
  }
};

export const passkeyChallenge = async (req: Request, res: Response) => {
  try {
    const userId = req.body.userId;
    if (!userStore[userId]) {
      return ResponseHandler("User not found", null, 404, true, res);
    }
    const challengePayload = await generateRegistrationOptions({
      rpID: "localhost", // Use your server's URL
      rpName: "passekey-test in localhost", // Use your app's name
      userName: userStore[userId].email,
    });
    challengeStore[userId] = challengePayload.challenge;
    return ResponseHandler(
      "Passkey challenge created successfully",
      { options: challengePayload },
      200,
      false,
      res
    );
  } catch (error) {
    console.log(error);
    return ResponseHandler("Something went wrong", null, 500, true, res);
  }
};


export const passkeyVerify = async (req: Request, res: Response) => {
  try {
    const { userId, cred } = req.body;
    if (!userStore[userId]) {
      return ResponseHandler("User not found", null, 404, true, res);
    }
    if(!challengeStore[userId]){
      return ResponseHandler("Challenge not found", null, 404, true, res);
    }
    const verificationResult = await verifyRegistrationResponse({
      expectedChallenge: challengeStore[userId],
      expectedOrigin: "http://localhost:5500",
      expectedRPID: "localhost",
      response: cred,
    });
    if (!verificationResult.verified) {
      return ResponseHandler(
        "Passkey verification failed",
        null,
        400,
        true,
        res
      );
    }
    userStore[userId].passKey = verificationResult.registrationInfo;
    return ResponseHandler(
      "Passkey challenge created successfully",
      null,
      200,
      false,
      res
    );
  } catch (error) {
    console.log(error);
    return ResponseHandler("Something went wrong", null, 500, true, res);
  }
};


export const passkeyLoginChallenge = async (req: Request, res: Response) => {
  try {
    const userId = req.body.userId;
    if (!userStore[userId]) {
      return ResponseHandler("User not found", null, 404, true, res);
    }
    const challengePayload = await generateAuthenticationOptions({
      rpID: "localhost", // Use your server's URL
    });
    loginChallengeStore[userId] = challengePayload.challenge;
    return ResponseHandler(
      "Passkey challenge created successfully",
      { options: challengePayload },
      200,
      false,
      res
    );
  } catch (error) {
    console.log(error);
    return ResponseHandler("Something went wrong", null, 500, true, res);
  }
};

export const passkeyLoginVerify = async (req: Request, res: Response) => {
  try {
    const { userId, cred } = req.body;
    if (!userStore[userId]) {
      return ResponseHandler("User not found", null, 404, true, res);
    }
    if(!loginChallengeStore[userId]){
      return ResponseHandler("Challenge not found", null, 404, true, res);
    }
    if(!userStore[userId].passKey){
      return ResponseHandler("Passkey not found", null, 404, true, res);
    }
    const verificationResult = await verifyAuthenticationResponse({
      expectedChallenge: loginChallengeStore[userId],
      expectedOrigin: "http://localhost:5500",
      expectedRPID: "localhost",
      response: cred,
      authenticator: userStore[userId].passKey,
    });

    if (!verificationResult.verified) {
      return ResponseHandler(
        "Passkey verification failed",
        null,
        400,
        true,
        res
      );
    };
    return ResponseHandler(
      "Passkey challenge verified successfully",
      null,
      200,
      false,
      res
    );
  } catch (error) {
    console.log(error);
    return ResponseHandler("Something went wrong", null, 500, true, res);
  }
};
