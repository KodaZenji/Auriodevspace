// app/api/search/[username]/route.js
import { NextResponse } from 'next/server';
import { getBurnerAuth } from '@/lib/burner-auth';

async function fetchWallchainRank(username) {
  try {
    const search = username.toLowerCase();
    const pageSize = 50;
    const epochs = ['1', '7d', '30d'];
    let foundUser = null;
    let totalUsers = 0;

    for (const epoch of epochs) {
      let page = 1;

      while (true) {
        const response = await fetch(
          `https://api.wallchain.xyz/voices/companies/spaace/leaderboard?page=${page}&pageSize=${pageSize}&orderBy=position&ascending=false&period-epoch-${epoch}`,
          {
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'Mozilla/5.0',
            },
            cache: 'no-store',
          }
        );

        if (!response.ok) {
          throw new Error(`Wallchain API error: ${response.status}`);
        }

        const data = await response.json();
        const users = data.data || data.leaderboard || data.users || data;

        if (!Array.isArray(users) || users.length === 0) break;

        totalUsers += users.length;

        // ✅ Corrected search inside xInfo
        foundUser = users.find((user) => {
          const fields = [
            user.xInfo?.username,
            user.xInfo?.name,
            user.xInfo?.id
          ];

          return fields.some(field => field && field.toLowerCase().includes(search));
        });

        if (foundUser) break;
        if (users.length < pageSize) break;
        page += 1;
      }

      if (foundUser) break;
    }

    return {
      found: !!foundUser,
      data: foundUser ? {
        username: foundUser.xInfo.username,
        name: foundUser.xInfo.name,
        rank: foundUser.xInfo.rank,
        score: foundUser.xInfo.score,
        scorePercentile: foundUser.xInfo.scorePercentile,
        scoreQuantile: foundUser.xInfo.scoreQuantile,
        imageUrl: foundUser.xInfo.imageUrl,
        position: foundUser.position,
        positionChange: foundUser.positionChange,
        mindsharePercentage: foundUser.mindsharePercentage,
        relativeMindshare: foundUser.relativeMindshare
      } : null,
      totalUsers
    };

  } catch (error) {
    console.error('Wallchain error:', error);
    return {
      found: false,
      error: error.message,
      totalUsers: 0
    };
  }
}

async function fetchSpaaceRank(username) {
  try {
    const burnerAuth = getBurnerAuth();
    const headers = await burnerAuth.getAuthHeaders();

    console.log('Using burner wallet:', burnerAuth.getAddress());

    const query = `
      query LoyaltyLeaderboard24h($limit: Float, $offset: Float, $seasonNumber: String) {
        loyaltyLeaderboard24h(limit: $limit, offset: $offset, seasonNumber: $seasonNumber) {
          nodes {
            points
            userAddress
            questCompleted
            boostMultiplier
            user {
              name
              imageUrl
              status
            }
            rank {
              rank
            }
          }
          totalCount
        }
      }
    `;

    const limit = 100;
    let offset = 0;
    let foundUser = null;
    let totalUsers = 0;

    while (true) {
      const response = await fetch("https://internal-api-v2.spaace.io/graphql", {
        method: "POST",
        headers,
        body: JSON.stringify({
          query,
          variables: {
            limit,
            offset,
            seasonNumber: null,
          },
        }),
        cache: "no-store",
      });

      const data = await response.json();
      const nodes = data.data?.loyaltyLeaderboard24h?.nodes || [];

      if (!Array.isArray(nodes) || nodes.length === 0) break;

      totalUsers += nodes.length;

      foundUser = nodes.find((entry) => {
        const name = entry.user?.name?.toLowerCase();
        const addr = entry.userAddress?.toLowerCase();
        const search = username.toLowerCase();

        return (name && name.includes(search)) || (addr && addr.includes(search));
      });

      if (foundUser) break;
      if (nodes.length < limit) break;
      offset += limit;
    }

    return {
      found: !!foundUser,
      data: foundUser || null,
      totalUsers,
      needsAuth: false,
    };
  } catch (error) {
    console.error("Spaace error:", error);
    return {
      found: false,
      error: error.message,
      needsAuth: true,
    };
  }
}

export async function GET(request, { params }) {
  const username = params.username;

  if (!username) {
    return NextResponse.json(
      { error: 'Username is required' },
      { status: 400 }
    );
  }

  try {
    const [wallchainResult, spaaceResult] = await Promise.all([
      fetchWallchainRank(username),
      fetchSpaaceRank(username),
    ]);

    return NextResponse.json({
      username,
      wallchain: wallchainResult,
      spaace: spaaceResult,
      burnerWallet: process.env.BURNER_WALLET_ADDRESS,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}