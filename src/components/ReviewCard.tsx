import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ReviewData, AppData } from "@/lib/types";

interface ReviewCardProps {
  review: ReviewData;
  app?: AppData;
}

export function ReviewCard({ review, app }: ReviewCardProps) {
  // Format date
  const formattedDate = new Date(review.updated).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Render stars based on score
  const renderStars = (score: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <span key={i} className={i < score ? "text-yellow-500" : "text-gray-300"}>
          ★
        </span>
      ));
  };

  return (
    <Card className="w-full">
      <CardHeader className="p-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold">{review.title || "タイトルなし"}</h3>
            <p className="text-sm text-muted-foreground">{review.userName}</p>
            {app && (
              <div className="flex items-center mt-1">
                {app.icon && (
                  <img 
                    src={app.icon} 
                    alt={app.title} 
                    className="w-4 h-4 mr-1 rounded-sm" 
                  />
                )}
                <p className="text-xs font-medium text-primary">
                  {app.title}
                </p>
              </div>
            )}
          </div>
          <div className="flex flex-col items-end">
            <div className="flex">{renderStars(review.score)}</div>
            <p className="text-xs text-muted-foreground">
              バージョン: {review.version}
            </p>
            <p className="text-xs text-muted-foreground">{formattedDate}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-sm whitespace-pre-line">{review.text}</p>
      </CardContent>
    </Card>
  );
} 