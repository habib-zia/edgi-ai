"use client";
import React from "react";
import AnalyticsDashboard from "@/components/report-analytics/analytics";
import RecentPosts from "@/components/report-analytics/RecentPosts";
import ProtectedRoute from "@/components/features/auth/ProtectedRoute";

export default function ReportAnalyticsPage() {
  const [selectedPlatform, setSelectedPlatform] = React.useState("All");
  const [hasPosts, setHasPosts] = React.useState(false);
  const [postsData, setPostsData] = React.useState<any[]>([]);

  return (
    <ProtectedRoute>
      <div>
        <AnalyticsDashboard 
          selectedPlatform={selectedPlatform} 
          setSelectedPlatform={setSelectedPlatform} 
          hasPosts={hasPosts}
          postsData={postsData}
        />
        <RecentPosts 
          selectedPlatform={selectedPlatform} 
          onPostsChange={setHasPosts}
          onPostsDataChange={setPostsData}
        />
      </div>
    </ProtectedRoute>
  );
}
