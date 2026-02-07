import { Express } from "express";
import { twitterAuthService } from "../services/auth";

export async function setupTwitterRoutes(app: Express) {
  app.get("/api/auth/twitter", async (req, res) => {
    const { code, state, walletAddress } = req.query;

    if (code) {
      try {
        const { accessToken, twitterUser } = await twitterAuthService.handleCallback(
          code as string,
          state as string,
          (req.session as any).twitterAuth
        );

        (req.session as any).twitterAccessToken = accessToken;
        (req.session as any).twitterUser = twitterUser;
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
      } catch (err: any) {
        console.error("[Twitter OAuth2 Error]", err);
        return res.status(400).send(err.message || "Twitter authentication failed");
      }
    }

    if (!walletAddress) {
      return res.status(400).send("Wallet address required");
    }

    const { state: stateValue, codeVerifier, codeChallenge } = twitterAuthService.generateAuthParams();

    (req.session as any).twitterAuth = {
      state: stateValue,
      code_verifier: codeVerifier,
      walletAddress,
    };

    await new Promise<void>((resolve, reject) => {
      req.session.save((err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    const twitterClient = await twitterAuthService.getClient();
    const authUrl = twitterClient.authorizationUrl({
      scope: "tweet.read users.read offline.access",
      state: stateValue,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    });

    return res.redirect(authUrl);
  });
}
