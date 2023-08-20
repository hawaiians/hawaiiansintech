import { initializeAdmin } from "@/lib/firebase-admin";
import { getURLWithQueryParams } from "@/lib/linkedin";
import * as admin from "firebase-admin";

export interface LinkedInData {
  firstName: string;
  lastName: string;
  email: string;
  token: string;
  profilePicture: string;
}

const getProfilePicture = async (auth: string): Promise<string> => {
  const displayData = await fetch(
    "https://api.linkedin.com/v2/me?projection=(id,profilePicture(displayImage~:playableStreams))",
    {
      method: "GET",
      headers: { Connection: "Keep-Alive", Authorization: auth },
    }
  );
  const dd = await displayData.json();
  const dd_elements = dd["profilePicture"]["displayImage~"]["elements"];
  const dd_identifiers = dd_elements.map(
    (e) => e["identifiers"].pop()["identifier"]
  );
  const profile_picture = dd_identifiers
    .filter((e) => e.includes("400_400")) // filter for 400x400
    .pop();
  return profile_picture;
};

const getEmailData = async (auth: string): Promise<string> => {
  const emailData = await fetch(
    "https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))",
    {
      method: "GET",
      headers: { Connection: "Keep-Alive", Authorization: auth },
    }
  );
  const ed = await emailData.json();
  const email = ed["elements"].pop()["handle~"]["emailAddress"];
  return email;
};

const getAccessToken = async (code, id, secret, redirect): Promise<string> => {
  const LINKEDIN_URL = getURLWithQueryParams(
    "https://www.linkedin.com/oauth/v2/accessToken",
    {
      grant_type: "authorization_code",
      code: code,
      client_id: id,
      client_secret: secret,
      redirect_uri: redirect,
    }
  );
  const resp = await fetch(LINKEDIN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  const tok = await resp.json();
  const { access_token, expires_in } = tok;
  return access_token;
};

const getLinkedInData = async (access_token: string): Promise<LinkedInData> => {
  await initializeAdmin();
  const linkedInAuth = "Bearer " + access_token;
  let u = {};
  const usr = await fetch("https://api.linkedin.com/v2/me", {
    method: "GET",
    headers: { Connection: "Keep-Alive", Authorization: linkedInAuth },
  });
  if (usr.ok) u = await usr.json();
  const firstName = u["localizedFirstName"];
  const lastName = u["localizedLastName"];
  const uid = u["id"];
  const token = await admin.auth().createCustomToken(uid);
  const profilePicture = await getProfilePicture(linkedInAuth);
  const email = await getEmailData(linkedInAuth);
  return { firstName, lastName, email, token, profilePicture };
};

export default async function handler(req, res) {
  // TODO: add error handling
  const access_token: string = await getAccessToken(
    req.body.code,
    req.body.id,
    req.body.secret,
    req.body.redirect
  );
  const result: LinkedInData = await getLinkedInData(access_token);
  res.status(200).json({
    firstName: result.firstName,
    lastName: result.lastName,
    email: result.email,
    token: result.token,
    profilePicture: result.profilePicture,
  });
}
