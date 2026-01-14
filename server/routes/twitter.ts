import { Express } from "express";
import { Issuer, generators } from "openid-client";
import fetch from "node-fetch";
import { storage } from "../storage";

const TWITTER_REDIRECT_URI = process.env.TWITTER_REDIRECT_URI!;
// חייב להיות זהה 100% למה שמוגדר ב-X Developer Portal

export async function setupTwitterRoutes(app: Express) {
  const twitterIssuer = new Issuer({
    issuer: "https://twitter.com",
    authorization_endpoint: "https://twitter.com/i/oauth2/authorize",
    token_endpoint: "https://api.twitter.com/2/oauth2/token",
  });

  const twitterClient = new twitterIssuer.Client({
    client_id: process.env.TWITTER_CLIENT_ID!,
    client_secret: process.env.TWITTER_CLIENT_SECRET!,
    redirect_uris: [TWITTER_REDIRECT_URI],
    response_types: ["code"],
    token_endpoint_auth_method: "client_secret_basic",
  });

  app.get("/api/auth/twitter", async (req, res) => {
    const { code, state, walletAddress } = req.query;

    /* ================= CALLBACK ================= */
    if (code) {
      console.log("[Twitter OAuth2] Callback received with code and state:", { 
        state, 
        sessionId: req.sessionID,
        sessionData: req.session
      });
      const session = (req.session as any).twitterAuth;
      console.log("[Twitter OAuth2] Session data from req.session.twitterAuth:", session);

      if (!session || session.state !== state) {
        console.error("[Twitter OAuth2] Session mismatch or missing:", { 
          hasSession: !!session, 
          sessionState: session?.state, 
          queryState: state,
          sessionId: req.sessionID
        });
        return res.status(400).send("Invalid or expired session");
      }

      try {
        const tokenSet = await twitterClient.oauthCallback(
          TWITTER_REDIRECT_URI,
          { code: code as string, state: state as string },
          { 
            code_verifier: session.code_verifier,
            state: session.state 
          },
        );

        console.log("[Twitter OAuth2] Token set received");
        const accessToken = tokenSet.access_token;
        if (!accessToken) throw new Error("No access token returned");

        const userRes = await fetch(
          "https://api.twitter.com/2/users/me?user.fields=profile_image_url,username",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        const userJson: any = await userRes.json();
        const twitterUser = userJson.data;

        if (!twitterUser) {
          throw new Error("Failed to fetch Twitter user");
        }

        // Check if this Twitter account is already linked to another wallet
        const existingUser = await storage.getUserByTwitterHandle(twitterUser.username);
        if (existingUser && existingUser.walletAddress !== session.walletAddress) {
          return res.status(400).send(`This Twitter account (@${twitterUser.username}) is already linked to another wallet.`);
        }

        const user = await storage.getUserByWallet(session.walletAddress);
        if (user) {
          await storage.updateUserSocials(user.id, {
            twitterHandle: twitterUser.username,
            profileImageUrl: twitterUser.profile_image_url,
          });
          // Store token securely in session or encrypted in DB for verification
          (req.session as any).twitterAccessToken = accessToken;
        }

        delete (req.session as any).twitterAuth;

        return res.send(`
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'TWITTER_AUTH_SUCCESS' }, window.location.origin);
              window.close();
            } else {
              window.location.href = "/dashboard";
            }
          </script>
        `);
      } catch (err) {
        console.error("[Twitter OAuth2 Error]", err);
        return res.status(500).send("Twitter authentication failed");
      }
    }

    /* ================= START LOGIN ================= */
    if (!walletAddress) {
      return res.status(400).send("Wallet address required");
    }

    const stateValue = generators.state();
    const codeVerifier = generators.codeVerifier();
    const codeChallenge = generators.codeChallenge(codeVerifier);

    (req.session as any).twitterAuth = {
      state: stateValue,
      code_verifier: codeVerifier,
      walletAddress,
    };

    const authUrl = twitterClient.authorizationUrl({
      scope: "tweet.read users.read offline.access",
      state: stateValue,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    });

    await new Promise((resolve, reject) => {
      req.session.save((err) => {
        if (err) reject(err);
        else resolve(true);
      });
    });

    console.log("[Twitter OAuth2] Session saved, redirecting to:", authUrl);
    return res.redirect(authUrl);
  });
}
