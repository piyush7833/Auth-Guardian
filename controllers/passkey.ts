import { generateRegistrationOptions, verifyRegistrationResponse, generateAuthenticationOptions, verifyAuthenticationResponse } from "@simplewebauthn/server";
import { Request, Response } from 'express';
import { getUserByEmail, createUser, getUserById,updateUserCounter } from "../db/db";
import { ResponseHandler } from "../helpers/response.helper";


const CLIENT_URL = "http://localhost:5173"
const RP_ID = "localhost"

export const passkeyRegisterInit=async (req:Request, res:Response) => {
  const email = req.query.email
  if (!email) {
    return res.status(400).json({ error: "Email is required" })
  }

  if (getUserByEmail(email as string) != null) {
    return res.status(400).json({ error: "User already exists" })
  }

  const options = await generateRegistrationOptions({
    rpID: RP_ID,
    rpName: "Auth Guardian",
    userName: email as string,
  })

  res.cookie(
    "regInfo",
    JSON.stringify({
      userId: options.user.id,
      email,
      challenge: options.challenge,
    }),
    { httpOnly: true, maxAge: 60000, secure: false, sameSite:"none"}
  )

  res.json(options)
}

export const passkeyVerifyRegister=async (req:Request,res:Response)  => {
  let regInfo: { userId: string; email: string; challenge: string };
  console.log(req.cookies,"req.cookies")
  if(req.cookies && req.cookies.regInfo){
     regInfo = JSON.parse(req.cookies.regInfo);
  } else {
     return ResponseHandler("Registration info not found",null,400,true,res);
  }
  const verification = await verifyRegistrationResponse({
    response: req.body,
    expectedChallenge: regInfo.challenge,
    expectedOrigin: CLIENT_URL,
    expectedRPID: RP_ID,
  })

  if (verification.verified && verification.registrationInfo) {
    createUser(regInfo.userId, regInfo.email, {
      id: verification.registrationInfo.credentialID,
      publicKey: verification.registrationInfo.credentialPublicKey,
      counter: verification.registrationInfo.counter,
      deviceType: verification.registrationInfo.credentialDeviceType,
      backedUp: verification.registrationInfo.credentialBackedUp,
      transport: req.body.transports,
    })
    res.clearCookie("regInfo")
    return res.json({ verified: verification.verified })
  } else {
    return res
      .status(400)
      .json({ verified: false, error: "Verification failed" })
  }
}

export const passkeyAuthInit=async (req:Request, res:Response) => {
  const email = req.query.email
  if (!email) {
    return res.status(400).json({ error: "Email is required" })
  }

  const user = getUserByEmail(email as string)
  if (user == null) {
    return res.status(400).json({ error: "No user for this email" })
  }

  const options = await generateAuthenticationOptions({
    rpID: RP_ID,
    allowCredentials: [
      {
        id: user.passKey.id,
        // type: "public-key",
        transports: user.passKey.transports,
      },
    ],
  })

  res.cookie(
    "authInfo",
    JSON.stringify({
      userId: user.id,
      challenge: options.challenge,
    }),
    { httpOnly: true, maxAge: 60000, secure: true }
  )

  res.json(options)
}

export const passkeyAuthVerify= async (req:Request, res:Response) => {
  const authInfo = JSON.parse(req.cookies.authInfo)

  if (!authInfo) {
    return res.status(400).json({ error: "Authentication info not found" })
  }

  const user = getUserById(authInfo.userId)
  if (user == null || user.passKey.id != req.body.id) {
    return res.status(400).json({ error: "Invalid user" })
  }

  const verification = await verifyAuthenticationResponse({
    response: req.body,
    expectedChallenge: authInfo.challenge,
    expectedOrigin: CLIENT_URL,
    expectedRPID: RP_ID,
    authenticator: {
      credentialID: user.passKey.id,
      credentialPublicKey: user.passKey.publicKey,
      counter: user.passKey.counter,
      transports: user.passKey.transports,
    },
  })

  if (verification.verified) {
    updateUserCounter(user.id, verification.authenticationInfo.newCounter)
    res.clearCookie("authInfo")
    // Save user in a session cookie
    return res.json({ verified: verification.verified })
  } else {
    return res
      .status(400)
      .json({ verified: false, error: "Verification failed" })
  }
}