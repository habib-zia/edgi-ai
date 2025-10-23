import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { API_CONFIG, getApiUrl, getAuthenticatedHeaders } from '@/lib/config';

interface ManualPost {
  id: number;
  content: string;
  post_hash: string;
  external_id: string | null;
  account_id: number;
  account_type: string;
  type: string;
  attachments: Array<{
    ext: string;
    mime: string;
    name: string;
    path: string;
    size: number;
    type: string;
    old_path: string;
    converted: boolean;
    url: string;
  }>;
  post_options: Record<string, any>;
  shortened_links: any[];
  error: string | null;
  source: string | null;
  user_id: number;
  user_name: string;
  publish_at: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  published: boolean;
  permalink: string | null;
  draft: boolean;
  approved: boolean;
  reject_reason: string | null;
  insights: any;
  can_edit: boolean;
  can_approve: boolean;
}

export const useManualPosts = () => {
  const [posts, setPosts] = useState<ManualPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userId = useSelector((state: RootState) => state.user.user?.id);

  const fetchManualPosts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const currentUserId = userId || localStorage.getItem('userId') as string;
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.SOCIALBU.POSTS_SCHEDULED), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthenticatedHeaders()
        },
        body: JSON.stringify({
          user_id: currentUserId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success && data.data?.items && Array.isArray(data.data.items)) {
        setPosts(data.data.items);
      } else {
        console.warn('API response structure unexpected, using sample data');
      }
    } catch (err) {
      console.error('Error fetching manual posts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch manual posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManualPosts();
  }, []);
  return {
    posts,
    loading,
    error,
    refetch: fetchManualPosts
  };
};
