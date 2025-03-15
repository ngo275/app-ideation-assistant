import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AppData } from "@/lib/types";

interface AppCardProps {
  app: AppData;
  isSelected: boolean;
  onSelect: (app: AppData) => void;
}

export function AppCard({ app, isSelected, onSelect }: AppCardProps) {
  return (
    <Card className={`w-full ${isSelected ? "border-2 border-primary" : ""}`}>
      <CardHeader className="flex flex-row items-center gap-4 p-4">
        <img
          src={app.icon}
          alt={app.title}
          className="h-16 w-16 rounded-lg object-cover"
        />
        <div className="flex flex-col">
          <h3 className="font-bold">{app.title}</h3>
          <p className="text-sm text-muted-foreground">{app.developer}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm">
              ★ {app.score.toFixed(1)} ({app.reviews.toLocaleString()})
            </span>
            <span className="text-sm">
              {app.free ? "無料" : `¥${app.price}`}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-sm line-clamp-3">{app.description}</p>
        <div className="flex flex-wrap gap-1 mt-2">
          {app.genres.map((genre) => (
            <span
              key={genre}
              className="text-xs bg-muted px-2 py-1 rounded-full"
            >
              {genre}
            </span>
          ))}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          variant={isSelected ? "destructive" : "default"}
          className="w-full"
          onClick={() => onSelect(app)}
        >
          {isSelected ? "選択解除" : "選択"}
        </Button>
      </CardFooter>
    </Card>
  );
} 