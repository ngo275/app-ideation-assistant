import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AnalysisResult as AnalysisResultType } from "@/lib/types";

interface AnalysisResultProps {
  analysis: AnalysisResultType;
}

export function AnalysisResult({ analysis }: AnalysisResultProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <h2 className="text-xl font-bold">一般的な問題点</h2>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2">
            {analysis.commonIssues.map((issue, index) => (
              <li key={index} className="text-md">
                {issue}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <h2 className="text-xl font-bold">提案される機能</h2>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2">
            {analysis.suggestions.map((suggestion, index) => (
              <li key={index} className="text-md">
                {suggestion}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
} 