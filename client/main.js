import { startAuthentication, startRegistration } from "@simplewebauthn/browser";

const signupButton = document.querySelector("[data-signup]");
const loginButton = document.querySelector("[data-login]");
const emailInput = document.querySelector("[data-email]");
const modal = document.querySelector("[data-modal]");
const closeButton = document.querySelector("[data-close]");

const googleButton=document.querySelector("[data-google]")
const githubButton=document.querySelector("[data-github]")
const twitterbutton = document.querySelector("[data-twitter]")
const facebookbutton = document.querySelector("[data-facebook]")

signupButton.addEventListener("click", signup);
loginButton.addEventListener("click", login);
closeButton.addEventListener("click", () => modal.close());

googleButton.addEventListener("click",googleAuth);
githubButton.addEventListener("click",githubAuth);
twitterbutton.addEventListener("click",twitterAuth);
facebookbutton.addEventListener("click",facebookAuth);

const SERVER_URL = "http://localhost:8000/api/auth-guardian";

async function signup() {
  const email = emailInput.value;

  // 1. Get challenge from server
  const initResponse = await fetch(
    `${SERVER_URL}/init-register?email=${email}`,
    { credentials: "include" }
  );
  const options = await initResponse.json();

  if (!initResponse.ok) {
    return showModalText(options.error);
  }

  // 2. Create passkey
  const registrationJSON = await startRegistration(options.options);

  // 3. Save passkey in DB
  // Get all cookies as a string
const cookies = document.cookie;

// Log the full cookie string
console.log("All cookies:", cookies);

  const verifyResponse = await fetch(`${SERVER_URL}/verify-register`, {
    credentials: "include",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ registrationJSON,regInfo: options.regInfo }),
  });

  const verifyData = await verifyResponse.json();
  if (!verifyResponse.ok) {
    return showModalText(verifyData.error);
  }
  if (verifyData.verified) {
    showModalText(`Successfully registered ${email}`);
  } else {
    showModalText(`Failed to register`);
  }
}

async function login() {
  const email = emailInput.value;

  // 1. Get challenge from server
  const initResponse = await fetch(`${SERVER_URL}/init-auth?email=${email}`, {
    credentials: "include",
  });
  const options = await initResponse.json();
  if (!initResponse.ok) {
    return showModalText(options.error);
  }

  // 2. Get passkey
  const authJSON = await startAuthentication(options);

  // 3. Verify passkey with DB
  const verifyResponse = await fetch(`${SERVER_URL}/verify-auth`, {
    credentials: "include",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(authJSON),
  });

  const verifyData = await verifyResponse.json();
  if (!verifyResponse.ok) {
    return showModalText(verifyData.error);
  }
  if (verifyData.verified) {
    showModalText(`Successfully logged in ${email}`);
  } else {
    showModalText(`Failed to log in`);
  }
}

function showModalText(text) {
  modal.querySelector("[data-content]").innerText = text;
  modal.showModal();
}


async function googleAuth (){
  try {
    const res=await fetch(
      `${SERVER_URL}/auth/google`,
    );
  } catch (error) {
    showModalText(error)
  }
}

async function githubAuth (){
  try {
    const res=await fetch(
      `${SERVER_URL}/github`,
    );
  } catch (error) {
    showModalText(error)
  }
}

async function twitterAuth (){
  try {
    const res=await fetch(
      `${SERVER_URL}/twitter`,
    );
  } catch (error) {
    showModalText(error)
  }
}

async function facebookAuth (){
  try {
    const res=await fetch(
      `${SERVER_URL}/auth/facebook`,
    );
  } catch (error) {
    showModalText(error)
  }
}