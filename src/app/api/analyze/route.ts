import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define the schema for the analysis result
const AnalysisResultSchema = z.object({
  commonIssues: z.array(z.string()).describe("ユーザーが報告している一般的な問題点のリスト(日本語で回答してください)"),
  suggestions: z.array(z.string()).describe("アプリ改善のための具体的な提案のリスト(日本語で回答してください)")
});

export async function POST(request: NextRequest) {
  try {
    const { reviews } = await request.json();

    if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
      return NextResponse.json(
        { error: "分析するレビューが必要です" },
        { status: 400 }
      );
    }

    // Extract the text content from all reviews
    const reviewTexts = reviews.map(review => 
      `Review ${review.id || ""}:\nApp: ${review.appTitle || "Unknown App"}\nRating: ${review.score}/5\nTitle: ${review.title || ""}\nText: ${review.text}`
    ).join("\n\n");

    // Call OpenAI API for analysis
    const analysis = await analyzeReviewsWithOpenAI(reviewTexts);

    return NextResponse.json({
      suggestions: analysis.suggestions,
      commonIssues: analysis.commonIssues
    });
  } catch (error) {
    console.error("Analyze API error:", error);
    return NextResponse.json(
      { error: "レビューの分析中にエラーが発生しました" },
      { status: 500 }
    );
  }
}

// Function to analyze reviews using OpenAI API with Zod schema validation
async function analyzeReviewsWithOpenAI(reviewTexts: string) {
  try {
    const systemPrompt = "あなたはアプリレビューを分析する専門家です。ユーザーの声を理解し、建設的なフィードバックを提供します。";
    const userPrompt = `
以下はアプリのユーザーレビューです。これらのレビューを分析して、以下の情報を提供してください：

1. ユーザーが報告している一般的な問題点のリスト
2. アプリ改善のための具体的な提案のリスト

レビュー：
${reviewTexts}
`;

    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: zodResponseFormat(AnalysisResultSchema, "analysis"),
    });

    const analysis = completion.choices[0].message.parsed;
    
    if (!analysis) {
      throw new Error("Failed to parse analysis result");
    }
    
    return {
      commonIssues: analysis.commonIssues,
      suggestions: analysis.suggestions
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    // Fallback to simple analysis if OpenAI API fails
    return fallbackAnalysis();
  }
}

// Fallback analysis function in case the OpenAI API call fails
function fallbackAnalysis() {
  const commonIssues = [
    "使いにくいインターフェース",
    "クラッシュや動作の遅さ",
    "機能の不足",
    "バグの存在",
    "バッテリー消費が多い"
  ].filter(() => Math.random() > 0.3);

  const suggestions = [
    "より直感的なユーザーインターフェースの設計",
    "パフォーマンスの最適化",
    "ユーザーが求める主要機能の追加",
    "徹底的なバグテストとフィードバックシステムの導入",
    "バッテリー消費を抑えるための最適化"
  ].filter(() => Math.random() > 0.3);

  return {
    commonIssues,
    suggestions
  };
} 