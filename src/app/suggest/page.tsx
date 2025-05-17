"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function SuggestPage() {
  const [term, setTerm] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!term.trim()) {
      setError("キーワードを入力してください");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/suggest?term=${encodeURIComponent(term)}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "サジェスト取得中にエラーが発生しました");
      }
      setSuggestions(data.suggestions || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "エラーが発生しました";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-4 text-center">検索サジェスト</h1>
      <p className="text-center mb-6">
        <Link href="/" className="text-primary underline">
          メインページへ戻る
        </Link>
      </p>

      <Card className="mb-8">
        <CardHeader>
          <h2 className="text-xl font-bold">キーワード候補を入力</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={fetchSuggestions} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="term">キーワード</Label>
              <div className="flex gap-2">
                <Input
                  id="term"
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  placeholder="例: メモ"
                />
                <Button type="submit" disabled={isLoading}>
                  取得
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}

      {suggestions.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">サジェスト結果</h2>
          <ul className="list-disc pl-5 space-y-2">
            {suggestions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
