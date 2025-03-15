import { AppStoreClient, Country } from "app-store-client";
import { NextRequest, NextResponse } from "next/server";
import { countryMap } from "@/lib/countryMap";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const term = searchParams.get("term");
    const countryCode = searchParams.get("country") || "US";
    const language = searchParams.get("language") || "en-us";
    const num = parseInt(searchParams.get("num") || "50", 50);

    if (!term) {
      return NextResponse.json(
        { error: "検索キーワードが必要です" },
        { status: 400 }
      );
    }

    // Check if country code is valid
    if (!countryMap[countryCode]) {
      return NextResponse.json(
        { error: `無効な国コード: ${countryCode}` },
        { status: 400 }
      );
    }

    // Convert string country code to Country enum value
    const country = countryMap[countryCode];
    
    console.log(`Searching for "${term}" in country: ${countryCode} (${country}), language: ${language}`);
    
    const client = new AppStoreClient({
      country,
      language,
    });

    const apps = await client.search({
      term,
      num,
      country,
      language,
    });

    console.log(`Found ${apps.length} apps for "${term}"`);
    return NextResponse.json({ apps });
  } catch (error) {
    console.error("Search API error:", error);
    const errorMessage = error instanceof Error ? error.message : "アプリの検索中にエラーが発生しました";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 