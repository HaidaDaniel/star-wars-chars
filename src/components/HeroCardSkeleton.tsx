import React from "react";
import { Card, CardContent, CardHeader } from "./ui/card";

/**
 * Skeleton loader component for HeroCard.
 * Displays a loading placeholder with animated pulse effect while hero data is being fetched.
 */
export const HeroCardSkeleton: React.FC = () => {
  return (
    <Card className="flex flex-col w-full min-h-140 bg-card text-card-foreground border-border">
      <div className="flex flex-col flex-1 p-4 sm:p-6 overflow-hidden">
        <CardHeader>
          <div className="h-8 w-48 bg-muted animate-pulse rounded mb-2" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="h-4 w-full bg-muted animate-pulse rounded" />
          <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
          <div className="h-4 w-full bg-muted animate-pulse rounded" />
          <div className="h-4 w-5/6 bg-muted animate-pulse rounded" />
          <div className="h-4 w-4/5 bg-muted animate-pulse rounded" />
          <div className="h-4 w-full bg-muted animate-pulse rounded" />
          <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
          <div className="h-4 w-5/6 bg-muted animate-pulse rounded" />
        </CardContent>
      </div>
    </Card>
  );
};

