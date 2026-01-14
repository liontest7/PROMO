import { Express } from "express";
import { Issuer, generators } from "openid-client";
import fetch from "node-fetch";
import { storage } from "../storage";
import OAuth from "oauth";

// Twitter OAuth 1.0a for Task Verification (Read/Write)
const twitterOAuth1 = new OAuth.OAuth(
  "https://api.twitter.com/oauth/request_token",
  "https://api.twitter.com/oauth/access_token",
  process.env.TWITTER_CLIENT_ID!, // Using Client ID as Consumer Key for OAuth 1.0a
  process.env.TWITTER_CLIENT_SECRET!, // Using Client Secret as Consumer Secret
  "1.0A",
  null,
  "HMAC-SHA1"
);

export async function setupTwitterRoutes(app: Express) {
  // OAuth 2.0 Issuer for Identity (Native App - Read Only)
  const twitterIssuer = new Issuer({
    issuer: "https://twitter.com",
    authorization_endpoint: "https://twitter.com/i/oauth2/authorize",
    token_endpoint: "https://api.twitter.com/2/oauth2/token",
  });

  const getTwitterClient = (req: any) => {
    const host = req.get('host') || process.env.REPLIT_DEV_DOMAIN;
    return new twitterIssuer.Client({
      client_id: process.env.TWITTER_CLIENT_ID!,
      redirect_uris: [`https://${host}/api/auth/twitter`],
      response_types: ["code"],
      token_endpoint_auth_method: "none",
    });
  };

  app.get("/api/auth/twitter", async (req, res) => {
    const { code, state, walletAddress } = req.query;
    const client = getTwitterClient(req);

    // Phase 2: Callback Handling
    if (code && state) {
      const session = (req.session as any).twitterAuth;
      if (!session || session.state !== state) {
        return res.status(400).send("Invalid OAuth state");
      }

      try {
        const tokenSet = await client.callback(
          client.metadata.redirect_uris![0],
          { code: code as string, state: state as string },
          { code_verifier: session.code_verifier }
        );

        const accessToken = tokenSet.access_token;
        if (!accessToken) throw new Error("No access token");

        const userRes = await fetch("https://api.twitter.com/2/users/me?user.fields=profile_image_url,username", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        const userJson: any = await userRes.json();
        const twitterUser = userJson.data;

        if (!twitterUser) throw new Error("Failed to fetch X user");

        const user = await storage.getUserByWallet(session.walletAddress);
        if (user) {
          await storage.updateUserSocials(user.id, {
            twitterHandle: twitterUser.username,
            profileImageUrl: twitterUser.profile_image_url,
          });
        }

        delete (req.session as any).twitterAuth;
        return res.send(`
          <script>
            if (window.opener) { window.opener.location.reload(); window.close(); }
            else { window.location.href = "/dashboard"; }
          </script>
        `);

      } catch (err) {
        console.error("Twitter OAuth Error:", err);
        return res.status(500).send("Twitter authentication failed");
      }
    }

    // Phase 1: Initiation
    if (!walletAddress) return res.status(400).send("Wallet address required");

    const stateValue = generators.state();
    const codeVerifier = generators.codeVerifier();
    const codeChallenge = generators.codeChallenge(codeVerifier);

    (req.session as any).twitterAuth = {
      state: stateValue,
      code_verifier: codeVerifier,
      walletAddress,
    };

    const authUrl = client.authorizationUrl({
      scope: "tweet.read users.read",
      state: stateValue,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    });

    res.redirect(authUrl);
  });
}
