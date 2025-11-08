export async function GET(request) {
  try {
    const durations = ["7D", "30D", "3M"];
    
    // Fetch all three durations in parallel
    const fetchPromises = durations.map(duration =>
      fetch(`https://gomtu.xyz/api/kaito/leaderboard/bitdealer?duration=${duration}`, {
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }).then(res => {
        if (!res.ok) {
          throw new Error(`Failed to fetch ${duration}: ${res.status}`);
        }
        return res.json();
      })
    );

    // Wait for all requests to complete
    const results = await Promise.all(fetchPromises);

    // Structure the response with all three durations
    const response = {
      "7d": results[0].data && Array.isArray(results[0].data) ? results[0].data.slice(0, 99) : [],
      "30d": results[1].data && Array.isArray(results[1].data) ? results[1].data.slice(0, 99) : [],
      "3m": results[2].data && Array.isArray(results[2].data) ? results[2].data.slice(0, 99) : []
    };

    return Response.json({ data: response });
  } catch (error) {
    console.error("API route error:", error);
    return Response.json({ error: "Failed to fetch leaderboard.", message: error.message }, { status: 500 });
  }
}