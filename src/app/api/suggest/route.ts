import { AppStoreClient } from "app-store-client";
import { NextRequest, NextResponse } from "next/server";
import { countryMap } from "@/lib/countryMap";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const term = searchParams.get("term");
    const countryCode = searchParams.get("country") || "US";
    const language = searchParams.get("language") || "en-us";

    if (!term) {
      return NextResponse.json({ error: "キーワードが必要です" }, { status: 400 });
    }

    if (!countryMap[countryCode]) {
      return NextResponse.json({ error: `無効な国コード: ${countryCode}` }, { status: 400 });
    }

    const country = countryMap[countryCode];

  const client = new AppStoreClient({ country, language });
  const suggestions = await client.suggestedTerms({ term });

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Suggest API error:", error);
    const errorMessage = error instanceof Error ? error.message : "サジェスト取得中にエラーが発生しました";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
