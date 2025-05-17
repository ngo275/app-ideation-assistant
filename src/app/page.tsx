"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AppCard } from "@/components/AppCard";
import { ReviewCard } from "@/components/ReviewCard";
import { AnalysisResult } from "@/components/AnalysisResult";
import { COUNTRY_OPTIONS, LANGUAGE_OPTIONS } from "@/lib/constants";
import { AppData, ReviewData, AnalysisResult as AnalysisResultType } from "@/lib/types";

export default function Home() {
  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [country, setCountry] = useState("JP");
  const [language, setLanguage] = useState("ja");
  const [searchResults, setSearchResults] = useState<AppData[]>([]);
  const [selectedApps, setSelectedApps] = useState<AppData[]>([]);
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResultType | null>(null);
  const [activeTab, setActiveTab] = useState<"search" | "reviews" | "analysis">("search");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreReviews, setHasMoreReviews] = useState(false);
  const [loadingMoreReviews, setLoadingMoreReviews] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "info" | "error" | "success" } | null>(null);

  // Show toast message
  const showToast = (message: string, type: "info" | "error" | "success" = "info") => {
    setToast({ message, type });
    // Auto-hide toast after 3 seconds
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Search for apps
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      showToast("検索キーワードを入力してください", "error");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSearchResults([]);
    setSelectedApps([]);
    setReviews([]);
    setAnalysis(null);
    setActiveTab("search");

    try {
      const response = await fetch(
        `/api/search?term=${encodeURIComponent(searchTerm)}&country=${country}&language=${language}&num=10`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "アプリの検索中にエラーが発生しました");
      }

      if (!data.apps || !Array.isArray(data.apps)) {
        throw new Error("アプリデータの形式が無効です");
      }

      setSearchResults(data.apps);
      if (data.apps.length === 0) {
        showToast("検索結果がありません", "info");
      } else {
        showToast(`${data.apps.length}件のアプリが見つかりました`, "success");
      }
    } catch (err) {
      console.error("Search error:", err);
      const errorMessage = err instanceof Error ? err.message : "エラーが発生しました";
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle app selection
  const toggleAppSelection = (app: AppData) => {
    setSelectedApps((prev) => {
      const isSelected = prev.some((a) => a.id === app.id);
      if (isSelected) {
        return prev.filter((a) => a.id !== app.id);
      } else {
        return [...prev, app];
      }
    });
  };

  // Fetch reviews for selected apps
  const fetchReviews = async (page = 1, append = false) => {
    if (selectedApps.length === 0) {
      setError("レビューを取得するアプリを選択してください");
      return;
    }

    if (page === 1) {
      setIsLoading(true);
      setError(null);
      setReviews([]);
      setAnalysis(null);
      setActiveTab("reviews");
    } else {
      setLoadingMoreReviews(true);
    }

    try {
      const allReviews: ReviewData[] = [];
      let hasMore = false;

      for (const app of selectedApps) {
        const response = await fetch(
          `/api/reviews?id=${app.id}&country=${country}&language=${language}&page=${page.toString()}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "レビューの取得中にエラーが発生しました");
        }

        if (!data.reviews || !Array.isArray(data.reviews)) {
          throw new Error("レビューデータの形式が無効です");
        }

        // Update hasMore flag if any app has more reviews
        if (data.hasMore) {
          hasMore = true;
        }

        // If we got a message about no more reviews, show it as a notification
        if (data.message && data.reviews.length === 0) {
          showToast(data.message, "info");
        }

        // Associate each review with its app
        const reviewsWithApp = data.reviews.map((review: ReviewData) => ({
          ...review,
          appId: app.id,
          appTitle: app.title,
          app: app
        }));

        allReviews.push(...reviewsWithApp);
      }

      // Only set hasMoreReviews to true if we actually got new reviews
      setHasMoreReviews(hasMore && allReviews.length > 0);
      setCurrentPage(page);
      
      if (append) {
        setReviews(prev => [...prev, ...allReviews]);
      } else {
        setReviews(allReviews);
      }
    } catch (err) {
      console.error("Reviews error:", err);
      const errorMessage = err instanceof Error ? err.message : "エラーが発生しました";
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
      setLoadingMoreReviews(false);
    }
  };

  // Load more reviews
  const loadMoreReviews = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const nextPage = currentPage + 1;
    fetchReviews(nextPage, true);
  };

  // Analyze reviews
  const analyzeReviews = async () => {
    if (reviews.length === 0) {
      const errorMsg = "分析するレビューがありません";
      setError(errorMsg);
      showToast(errorMsg, "error");
      return;
    }

    setIsLoading(true);
    setError(null);
    setActiveTab("analysis");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reviews }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "レビューの分析中にエラーが発生しました");
      }

      setAnalysis(data);
      showToast("分析が完了しました", "success");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "エラーが発生しました";
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">
        アプリアイデア発想ツール
      </h1>
      <p className="text-center mb-8">
        <Link href="/suggest" className="text-primary underline">
          キーワードサジェストページへ
        </Link>
      </p>

      {/* Toast Notification */}
      {toast && (
        <div 
          className={`fixed top-4 right-4 p-4 rounded-md shadow-md z-50 transition-opacity duration-300 ${
            toast.type === "error" 
              ? "bg-red-100 border border-red-400 text-red-700" 
              : toast.type === "success"
              ? "bg-green-100 border border-green-400 text-green-700"
              : "bg-blue-100 border border-blue-400 text-blue-700"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Search Form */}
      <Card className="mb-8">
        <CardHeader>
          <h2 className="text-xl font-bold">アプリを検索</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">国</Label>
                <Select
                  value={country}
                  onValueChange={setCountry}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="国を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">言語</Label>
                <Select
                  value={language}
                  onValueChange={setLanguage}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="言語を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="search">キーワード</Label>
                <div className="flex gap-2">
                  <Input
                    id="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="例: 日記、カレンダー、メモ"
                  />
                  <Button type="submit" disabled={isLoading}>
                    検索
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b mb-4">
        <button
          className={`px-4 py-2 ${
            activeTab === "search"
              ? "border-b-2 border-primary font-bold"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("search")}
        >
          検索結果 ({searchResults.length})
        </button>
        <button
          className={`px-4 py-2 ${
            activeTab === "reviews"
              ? "border-b-2 border-primary font-bold"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("reviews")}
        >
          ネガティブレビュー ({reviews.length})
        </button>
        <button
          className={`px-4 py-2 ${
            activeTab === "analysis"
              ? "border-b-2 border-primary font-bold"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("analysis")}
          disabled={!analysis}
        >
          分析結果
        </button>
      </div>

      {/* Search Results */}
      {activeTab === "search" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">
              検索結果 ({searchResults.length})
            </h2>
            <div className="flex gap-2">
              <Button
                onClick={() => fetchReviews(1, false)}
                disabled={selectedApps.length === 0 || isLoading}
              >
                レビューを取得 ({selectedApps.length})
              </Button>
            </div>
          </div>

          {searchResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((app) => (
                <AppCard
                  key={app.id}
                  app={app}
                  isSelected={selectedApps.some((a) => a.id === app.id)}
                  onSelect={toggleAppSelection}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 my-8">
              {searchTerm
                ? "検索結果がありません"
                : "キーワードを入力して検索してください"}
            </p>
          )}
        </div>
      )}

      {/* Reviews */}
      {activeTab === "reviews" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">
              ネガティブレビュー ({reviews.length})
            </h2>
            <div className="flex gap-2">
              <Button
                onClick={analyzeReviews}
                disabled={reviews.length === 0 || isLoading}
              >
                レビューを分析
              </Button>
            </div>
          </div>

          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} app={review.app} />
              ))}
              
              {hasMoreReviews && (
                <div className="flex justify-center mt-6">
                  <Button 
                    onClick={loadMoreReviews} 
                    disabled={loadingMoreReviews}
                    variant="outline"
                    className="w-full max-w-xs"
                  >
                    {loadingMoreReviews ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary mr-2"></div>
                        読み込み中...
                      </div>
                    ) : (
                      "もっと読み込む"
                    )}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-center text-gray-500 my-8">
              レビューがありません
            </p>
          )}
        </div>
      )}

      {/* Analysis Results */}
      {activeTab === "analysis" && analysis && (
        <div>
          <h2 className="text-xl font-bold mb-4">分析結果</h2>
          <AnalysisResult analysis={analysis} />
        </div>
      )}
    </main>
  );
}
