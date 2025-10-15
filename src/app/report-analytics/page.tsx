"use client";
import React from "react";
import AnalyticsDashboard from "@/components/report-analytics/analytics";
import RecentPosts from "@/components/report-analytics/RecentPosts";
import { useTopPostsInsights } from "@/hooks/useTopPostsInsights";

export default function ReportAnalyticsPage() {
  const [selectedPlatform, setSelectedPlatform] = React.useState("All");
  const [hasPosts, setHasPosts] = React.useState(false);
  const [postsData, setPostsData] = React.useState<any[]>([]);

  // Initialize the top posts insights hook
  const { topPostsData, loading: insightsLoading, fetchTopPostsInsights } = useTopPostsInsights();

  // Fetch insights data when component mounts
  React.useEffect(() => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30); // Last 30 days
    const endDate = new Date();
    
    fetchTopPostsInsights(
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0],
      'reel'
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array to run only once on mount

  return (
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
  );
}
