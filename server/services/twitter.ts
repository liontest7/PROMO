import fetch from "node-fetch";

export async function verifyTwitterFollow(accessToken: string, targetUsername: string): Promise<boolean> {
  try {
    // 1. Get user ID from username
    const userRes = await fetch(`https://api.twitter.com/2/users/by/username/${targetUsername}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const userData: any = await userRes.json();
    if (!userData.data) return false;
    const targetUserId = userData.data.id;

    // 2. Check if following
    const meRes = await fetch("https://api.twitter.com/2/users/me", {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const meData: any = await meRes.json();
    if (!meData.data) return false;
    const myUserId = meData.data.id;

    const followRes = await fetch(`https://api.twitter.com/2/users/${myUserId}/following`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const followData: any = await followRes.json();
    
    return followData.data?.some((u: any) => u.id === targetUserId) || false;
  } catch (error) {
    console.error("Twitter follow verification error:", error);
    return false;
  }
}

export async function verifyTwitterRetweet(accessToken: string, tweetId: string): Promise<boolean> {
  try {
    const meRes = await fetch("https://api.twitter.com/2/users/me", {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const meData: any = await meRes.json();
    if (!meData.data) return false;
    const myUserId = meData.data.id;

    const retweetRes = await fetch(`https://api.twitter.com/2/tweets/${tweetId}/retweeted_by`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const retweetData: any = await retweetRes.json();
    
    return retweetData.data?.some((u: any) => u.id === myUserId) || false;
  } catch (error) {
    console.error("Twitter retweet verification error:", error);
    return false;
  }
}
