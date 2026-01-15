import fetch from "node-fetch";

// Optimized Twitter verification service with reusable ID fetching
async function getUserId(accessToken: string, username?: string): Promise<string | null> {
  const url = username 
    ? `https://api.twitter.com/2/users/by/username/${username}`
    : "https://api.twitter.com/2/users/me";
  
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  const data: any = await res.json();
  return data.data?.id || null;
}

export async function verifyTwitterFollow(accessToken: string, targetUsername: string): Promise<boolean> {
  try {
    const [targetUserId, myUserId] = await Promise.all([
      getUserId(accessToken, targetUsername),
      getUserId(accessToken)
    ]);

    if (!targetUserId || !myUserId) return false;

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
    const myUserId = await getUserId(accessToken);
    if (!myUserId) return false;

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
