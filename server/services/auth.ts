import { storage } from "../storage";
import { Issuer, Client, generators } from "openid-client";
import fetch from "node-fetch";

const TWITTER_REDIRECT_URI = process.env.TWITTER_REDIRECT_URI!;

export class TwitterAuthService {
  private client: Client | null = null;

  async getClient() {
    if (this.client) return this.client;
    const twitterIssuer = new Issuer({
      issuer: "https://twitter.com",
      authorization_endpoint: "https://twitter.com/i/oauth2/authorize",
      token_endpoint: "https://api.twitter.com/2/oauth2/token",
    });

    this.client = new twitterIssuer.Client({
      client_id: process.env.TWITTER_CLIENT_ID!,
      client_secret: process.env.TWITTER_CLIENT_SECRET!,
      redirect_uris: [TWITTER_REDIRECT_URI],
      response_types: ["code"],
      token_endpoint_auth_method: "client_secret_basic",
    });
    return this.client;
  }

  async handleCallback(code: string, state: string, session: any) {
    if (!session || session.state !== state) {
      throw new Error("Invalid or expired session");
    }

    const twitterClient = await this.getClient();
    const tokenSet = await twitterClient.oauthCallback(
      TWITTER_REDIRECT_URI,
      { code, state },
      { code_verifier: session.code_verifier, state: session.state }
    );

    const accessToken = tokenSet.access_token;
    if (!accessToken) throw new Error("No access token returned");

    const userRes = await fetch(
      "https://api.twitter.com/2/users/me?user.fields=profile_image_url,username,created_at,public_metrics",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const userJson: any = await userRes.json();
    if (!userJson.data) throw new Error("Failed to fetch Twitter user");

    const twitterUser = {
      ...userJson.data,
      followers_count: userJson.data?.public_metrics?.followers_count || 0
    };

    const existingUser = await storage.getUserByTwitterHandle(twitterUser.username);
    if (existingUser && existingUser.walletAddress !== session.walletAddress) {
      throw new Error(`This Twitter account (@${twitterUser.username}) is already linked to another wallet.`);
    }

    const user = await storage.getUserByWallet(session.walletAddress);
    if (user) {
      await storage.updateUserSocials(user.id, {
        twitterHandle: twitterUser.username,
        profileImageUrl: twitterUser.profile_image_url,
      });
    }

    return { accessToken, twitterUser };
  }

  generateAuthParams() {
    const state = generators.state();
    const codeVerifier = generators.codeVerifier();
    const codeChallenge = generators.codeChallenge(codeVerifier);
    return { state, codeVerifier, codeChallenge };
  }
}

export const twitterAuthService = new TwitterAuthService();
