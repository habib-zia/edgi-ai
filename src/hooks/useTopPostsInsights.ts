import { useState, useCallback } from 'react';
import { apiService } from '@/lib/api-service';

interface TopPostsInsightsData {
  posts: any[];
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalImpressions: number;
  totalReach: number;
  totalInteractions: number;
}

interface UseTopPostsInsightsReturn {
  topPostsData: TopPostsInsightsData | null;
  loading: boolean;
  error: string | null;
  fetchTopPostsInsights: (startDate: string, endDate: string, postType?: string) => Promise<void>;
}

export const useTopPostsInsights = (): UseTopPostsInsightsReturn => {
  const [topPostsData, setTopPostsData] = useState<TopPostsInsightsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTopPostsInsights = useCallback(async (startDate: string, endDate: string, postType: string = 'video') => {
    // Check if user is authenticated before making API call
    const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!accessToken) {
      console.log('🔐 useTopPostsInsights: No access token, skipping API call');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiService.getTopPostsInsights(startDate, endDate, postType);
      
      if (response.success && response.data) {
        // Process the API response to extract insights data
        const processedData = processTopPostsData(response.data);
        setTopPostsData(processedData);
      } else {
        setError(response.message || 'Failed to fetch top posts insights');
      }
    } catch (err:any) {
      console.log(err)
      if(err.status === 401) {
        return;
      }
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch top posts insights';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Helper function to process the API response
  const processTopPostsData = (apiData: any): TopPostsInsightsData => {
    let totalLikes = 0;
    let totalComments = 0;
    let totalShares = 0;
    let totalImpressions = 0;
    let totalReach = 0;
    let totalInteractions = 0;

    // The API response has data.insights array, not data.posts
    const posts = apiData.insights || [];

    // Calculate totals from the posts data
    posts.forEach((post: any) => {
      if (post.insights) {
        post.insights.forEach((insight: any) => {
          switch (insight.type) {
            case 'like_count':
            case 'likes':
              totalLikes += insight.value || 0;
              break;
            case 'comments_count':
            case 'comments':
              totalComments += insight.value || 0;
              break;
            case 'shares':
              totalShares += insight.value || 0;
              break;
            case 'impressions':
              totalImpressions += insight.value || 0;
              break;
            case 'reach':
              totalReach += insight.value || 0;
              break;
            case 'total_interactions':
              totalInteractions += insight.value || 0;
              break;
          }
        });
      }
    });

    return {
      posts,
      totalLikes,
      totalComments,
      totalShares,
      totalImpressions,
      totalReach,
      totalInteractions
    };
  };

  return {
    topPostsData,
    loading,
    error,
    fetchTopPostsInsights
  };
};
