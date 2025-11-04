"use client";
import React from "react";
import AnalyticsDashboard from "@/components/report-analytics/analytics";
import RecentPosts from "@/components/report-analytics/RecentPosts";
import { useTopPostsInsights } from "@/hooks/useTopPostsInsights";
import ProtectedRoute from "@/components/features/auth/ProtectedRoute";
import { useAppSelector } from "@/store/hooks";

export default function ReportAnalyticsPage() {
  const [selectedPlatform, setSelectedPlatform] = React.useState("All");
  const [hasPosts, setHasPosts] = React.useState(false);
  const [postsData, setPostsData] = React.useState<any[]>([]);
  const { isAuthenticated } = useAppSelector((state) => state.user);

  const { topPostsData, loading: insightsLoading, fetchTopPostsInsights } = useTopPostsInsights();

  React.useEffect(() => {
    if (!isAuthenticated) return;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    const endDate = new Date();
    
    fetchTopPostsInsights(
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0],
      'reel'
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  return (
    <ProtectedRoute>
      <div>
        <AnalyticsDashboard 
          selectedPlatform={selectedPlatform} 
          setSelectedPlatform={setSelectedPlatform} 
          hasPosts={hasPosts}
          postsData={postsData}
          topPostsData={topPostsData}
          insightsLoading={insightsLoading}
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
