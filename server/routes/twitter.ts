import { Express } from "express";
import { Issuer, generators } from "openid-client";
import { storage } from "../storage";

export async function setupTwitterRoutes(app: Express) {
  const twitterIssuer = await Issuer.discover("https://twitter.com/.well-known/openid-configuration").catch(() => null) || 
    new Issuer({
      issuer: "https://twitter.com",
      authorization_endpoint: "https://twitter.com/i/oauth2/authorize",
      token_endpoint: "https://api.twitter.com/2/oauth2/token",
      userinfo_endpoint: "https://api.twitter.com/2/users/me"
    });

  const getTwitterClient = (req: any) => {
    const host = req.get('host') || process.env.REPLIT_DEV_DOMAIN;
    return new twitterIssuer.Client({
      client_id: process.env.TWITTER_CLIENT_ID!,
      client_secret: process.env.TWITTER_CLIENT_SECRET!,
      redirect_uris: [`https://${host}/api/auth/twitter`],
      response_types: ["code"],
    });
  };

  app.get('/api/auth/twitter', async (req, res) => {
    const { state, code, walletAddress } = req.query;
    const client = getTwitterClient(req);

    if (code && state) {
      const sessionData = (req.session as any).twitterAuth;
      if (!sessionData || sessionData.state !== state) {
        return res.status(400).send("Invalid session state");
      }

      try {
        const tokenSet = await client.callback(
          client.metadata.redirect_uris![0],
          { code: code as string, state: state as string },
          { code_verifier: sessionData.code_verifier, state: state as string }
        );

        const userinfo: any = await client.userinfo(tokenSet);
        const user = await storage.getUserByWallet(sessionData.walletAddress);
        
        if (user) {
          await storage.updateUserSocials(user.id, {
            twitterHandle: userinfo.data.username,
            profileImageUrl: userinfo.data.profile_image_url
          });
        }

        delete (req.session as any).twitterAuth;
        return res.send(`
          <script>
            if (window.opener) {
              window.opener.location.reload();
              window.close();
            } else {
              window.location.href = "/dashboard";
            }
          </script>
        `);
      } catch (err: any) {
        console.error("Twitter Auth Error:", err);
        return res.status(500).send("Authentication failed");
      }
    }

    if (!walletAddress) return res.status(400).send("Wallet address required");

    const newState = generators.state();
    const code_verifier = generators.codeVerifier();
    const code_challenge = generators.codeChallenge(code_verifier);

    (req.session as any).twitterAuth = {
      state: newState,
      code_verifier,
      walletAddress: walletAddress as string
    };

    const authUrl = client.authorizationUrl({
      scope: "tweet.read users.read follows.read offline.access",
      state: newState,
      code_challenge,
      code_challenge_method: "S256",
    });

    res.redirect(authUrl);
  });
}
