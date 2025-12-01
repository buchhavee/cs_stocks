import { NextRequest, NextResponse } from "next/server";

const CSFLOAT_API_BASE = "https://csfloat.com/api/v1";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Byg query string fra alle search params
    const queryString = searchParams.toString();
    const url = `${CSFLOAT_API_BASE}/listings${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: process.env.CSFLOAT_API_KEY || "",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: `CSFloat API error: ${response.statusText}` }, { status: response.status });
    }

    const data = await response.json();

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600", // Cache i 5 min
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch from CSFloat API" }, { status: 500 });
  }
}
