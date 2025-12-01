import { NextRequest, NextResponse } from "next/server";

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutter

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const dataset = searchParams.get("dataset");
  const config = searchParams.get("config");
  const split = searchParams.get("split");
  const offset = searchParams.get("offset");
  const length = searchParams.get("length");

  if (!dataset || !config || !split || !offset || !length) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  }

  const url = `https://datasets-server.huggingface.co/rows?dataset=${dataset}&config=${config}&split=${split}&offset=${offset}&length=${length}`;
  const cacheKey = `${dataset}-${config}-${split}-${offset}-${length}`;

  // Tjek cache først
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`✅ Cache hit for offset ${offset}`);
    return NextResponse.json(cached.data, {
      headers: {
        "X-Cache": "HIT",
      },
    });
  }

  try {
    console.log(`🌐 Fetching from Hugging Face API: offset ${offset}`);
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // Next.js server-side fetch har ikke CORS problemer
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Hugging Face API Error:", errorText);
      return NextResponse.json({ error: `API error: ${response.status}` }, { status: response.status });
    }

    const data = await response.json();

    // Gem i cache
    cache.set(cacheKey, { data, timestamp: Date.now() });
    console.log(`💾 Cached response for offset ${offset}`);

    return NextResponse.json(data, {
      headers: {
        "X-Cache": "MISS",
      },
    });
  } catch (error) {
    console.error("Error proxying request to Hugging Face:", error);
    return NextResponse.json({ error: "Failed to fetch from Hugging Face" }, { status: 500 });
  }
}
