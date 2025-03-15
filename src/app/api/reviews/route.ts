import { AppStoreClient } from "app-store-client";
import { NextRequest, NextResponse } from "next/server";
import { countryMap } from "@/lib/countryMap";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const appId = searchParams.get("appId");
    const id = searchParams.get("id");
    const countryCode = searchParams.get("country") || "US";
    const language = searchParams.get("language") || "en-us";
    const pageParam = searchParams.get("page");
    const page = pageParam ? parseInt(pageParam, 10) : 1;

    if (!appId && !id) {
      return NextResponse.json(
        { error: "アプリIDが必要です" },
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
    
    const client = new AppStoreClient({
      country,
      language,
    });

    try {
      const reviews = await client.reviews({
        ...(appId ? { appId } : {}),
        ...(id ? { id } : {}),
        country,
        language,
        page,
      });

      // Filter for negative reviews (score 1 or 2)
      const negativeReviews = reviews.filter(review => review.score <= 2);

      return NextResponse.json({ 
        reviews: negativeReviews,
        page,
        hasMore: negativeReviews.length > 0 // Assuming if we got reviews, there might be more
      });
    } catch (apiError) {
      console.error("App Store API error:", apiError);
      
      // Check if it's a "no more reviews" error (usually happens when page is beyond available data)
      if (apiError instanceof Error && 
          (apiError.message.includes("no more reviews") || 
           apiError.message.includes("page not found") ||
           apiError.message.includes("invalid page"))) {
        // Return empty reviews array with hasMore=false to indicate end of pagination
        return NextResponse.json({ 
          reviews: [],
          page,
          hasMore: false,
          message: "これ以上のレビューはありません"
        });
      }
      
      // Re-throw for other errors to be caught by outer catch block
      throw apiError;
    }
  } catch (error) {
    console.error("Reviews API error:", error);
    const errorMessage = error instanceof Error ? error.message : "レビューの取得中にエラーが発生しました";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 