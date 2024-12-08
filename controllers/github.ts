import axios from "axios";
import { ResponseHandler } from "../helpers/response.helper";
import { Request, Response } from "express";

const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const CALLBACK_URL = process.env.GITHUB_CALLBACK_URL;

export const githubAuth = async (req: Request, res: Response) => {
  try {
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${CALLBACK_URL}&scope=user`;
    console.log(githubAuthUrl);
    res.redirect(githubAuthUrl);
  } catch (error) {
    return ResponseHandler("Something went wrong", null, 500, true, res);
  }
};


export const githubAuthCallback = async (req: Request, res: Response) => {
  try {
    const { code } = req.query;
    // Exchange code for access token
    const tokenResponse = await axios.post(
      `https://github.com/login/oauth/access_token`,
      {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code: code,
      },
      {
        headers: { Accept: "application/json" },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    // Step 3: Use access token to get user info
    const userResponse = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    console.log(userResponse);
    const data = {
      userName: userResponse.data.login,
      name: userResponse.data.name,
      email: userResponse.data.email,
      phone: userResponse.data.phone,
      avatar: userResponse.data.avatar_url,
    };
    console.log(data);
    return ResponseHandler(
      "Github Authenticated successfully",
      data,
      200,
      false,
      res
    );
  } catch (error) {
    return ResponseHandler("Something went wrong", null, 500, true, res);
  }
};
