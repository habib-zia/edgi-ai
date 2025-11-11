
"use client";
import React, { useEffect, useState } from "react";
import { FaLink, FaClock } from "react-icons/fa6";
import PostCard from "./PostCard";
import Link from "next/link";
import { useRecentPosts } from "@/hooks/useRecentPosts";
import { recentPostsData } from "./SocialData";
import apiService from "@/lib/api-service";
import { emptyPlatformIcon, getPlatformIcon } from "./PlatformIcon";
import ConnectAccountsModal from "../ui/connect-accounts-modal";

interface RecentPostsProps {
  selectedPlatform: string;
  onPostsChange?: (hasPosts: boolean) => void;
  onPostsDataChange?: (postsData: any[]) => void;
}

export default function RecentPosts({ selectedPlatform, onPostsChange, onPostsDataChange }: RecentPostsProps) {

  const {
    showConnectAccountsModal,
    handleAccountsClick,
    handleConnectAccountsClose,
    handleConnectAccountsNext,
    handleDaySelect,
    handlePlatformSelect,
    getDefaultDay
  } = useRecentPosts();
  
  const [publishedPosts, setPublishedPosts] = useState<any[]>([])
  const [publishedPostsLoading, setPublishedPostsLoading] = useState(false)
  const [publishedPostsError, setPublishedPostsError] = useState<string | null>(null);

  const filterPostsByPlatform = (posts: any[]) => {
    if (selectedPlatform === 'All') {
      return posts;
    }
    return posts.filter(post => {
      if (post.platforms && post.platforms[selectedPlatform]) {
        return true;
      }
      return false;
    });
  };

  const filteredPublishedPosts = filterPostsByPlatform(publishedPosts);
  const filteredRecentPosts = filterPostsByPlatform(recentPostsData);

  React.useEffect(() => {
    const hasAnyPosts = filteredPublishedPosts.length > 0 || filteredRecentPosts.length > 0;
    onPostsChange?.(hasAnyPosts);
    onPostsDataChange?.(publishedPosts);
  }, [filteredPublishedPosts.length, filteredRecentPosts.length, publishedPosts, onPostsChange, onPostsDataChange]);
  
  const transformApiDataToPostCard = (apiPosts: any[]) => {
    
    const transformed = apiPosts.map((post, index) => ({
      id: post.id || index + 1000,
      type: post.type,
      image: post.type === 'video' ? null : (post.attachments?.[0]?.url || null),
      name: post.content?.substring(0, 32) + (post.content?.length > 32 ? "..." : "") || "Post Title",
      date: new Date(post.published_at || post.publish_at).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      content: post.content,
      attachments: post.attachments,
      insights: post.insights || [],
      account_type: post.account_type,
      published_at: post.published_at,
      publish_at: post.publish_at,
      permalink: post.permalink || null,
      platforms: {
        [getPlatformFromAccountType(post.account_type)]: {
          performanceData: generatePerformanceData(post.insights),
          metrics: {
            reach: { 
              value: getInsightValue(post.insights, 'reach') || 0,
              change: getInsightValue(post.insights, 'reach_change') || 0
            },
            impression: { 
              value: getInsightValue(post.insights, 'impression') || 0,
              change: getInsightValue(post.insights, 'impression_change') || 0
            },
            engagement: { 
              value: getInsightValue(post.insights, 'engagement') || 0,
              change: getInsightValue(post.insights, 'engagement_change') || 0
            }
          },
          engagement: {
            likes: getInsightValue(post.insights, 'likes') || 0,
            comments: getInsightValue(post.insights, 'comments') || 0,
            shares: getInsightValue(post.insights, 'shares') || 0
          }
        }
      }
    }));
    
    return transformed;
  };

  const getPlatformFromAccountType = (accountType: string) => {
    if (accountType?.includes('Instagram')) return 'Instagram';
    if (accountType?.includes('Facebook')) return 'Facebook';
    if (accountType?.includes('LinkedIn')) return 'LinkedIn';
    if (accountType?.includes('YouTube')) return 'YouTube';
    if (accountType?.includes('Twitter') || accountType?.includes('X')) return 'X';
    if (accountType?.includes('TikTok')) return 'TikTok';
    return 'Instagram';
  };


  const getInsightValue = (insights: any[], type: string) => {
    if (!insights || !Array.isArray(insights)) return null;
    const insight = insights.find(i => i.type === type);
    return insight?.value || null;
  };

  const generatePerformanceData = (insights: any[]) => {
    const reachValue = getInsightValue(insights, 'reach') || 0;
    
    if (reachValue === 0) {
      return [
        { day: 'Mon', value: 0 },
        { day: 'Tue', value: 0 },
        { day: 'Wed', value: 0 },
        { day: 'Thu', value: 0 },
        { day: 'Fri', value: 0 },
        { day: 'Sat', value: 0 },
        { day: 'Sun', value: 0 }
      ];
    }
    
    const dailyData = getInsightValue(insights, 'daily_reach') || getInsightValue(insights, 'daily_breakdown');
    
    if (dailyData && Array.isArray(dailyData)) {
      return dailyData.map((dayData, index) => ({
        day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index] || 'Mon',
        value: dayData.value || dayData || 0
      }));
    }
    
    return [
      { day: 'Mon', value: reachValue },
      { day: 'Tue', value: reachValue },
      { day: 'Wed', value: reachValue },
      { day: 'Thu', value: reachValue },
      { day: 'Fri', value: reachValue },
      { day: 'Sat', value: reachValue },
      { day: 'Sun', value: reachValue }
    ];
  };
  
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) return;
    
      fetchPublishedPosts()
    }, []) // eslint-disable-line react-hooks/exhaustive-deps
  
  const fetchPublishedPosts = async () => {
    try {
      setPublishedPostsLoading(true)
      setPublishedPostsError(null)
      
      const response = await apiService.getPublishedPosts()

      if (response.data && response.data.posts) {
      }
      
      
      if (response.success && response.data) {
        if (response.data.posts && Array.isArray(response.data.posts)) {
          const transformedPosts = transformApiDataToPostCard(response.data.posts);
          setPublishedPosts(transformedPosts);
        } else {
          setPublishedPosts([])
        }
        
        setPublishedPostsError(null)
      } else {
        setPublishedPostsError(response.message || 'Failed to fetch published posts')
        setPublishedPosts([])
      }
    } catch (error: any) {
      setPublishedPostsError(error.message || 'Failed to load published posts')
      setPublishedPosts([])
    } finally {
      setPublishedPostsLoading(false)
    }
  }
  return (
    <div className="w-full bg-white/90 py-14 px-2 md:px-8">
      <div className="max-w-[1260px] w-full mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <h1 className="text-3xl md:text-[40px] font-semibold text-[#171717]">Recent Posts</h1>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleAccountsClick}
              className="flex items-center gap-2 px-4 py-[8px] border-2 border-[#5046E5] text-[#5046E5] rounded-full text-lg font-medium hover:bg-[#5046E5] hover:text-white transition-colors"
            >
              <FaLink className="text-sm" />
              Accounts
            </button>
            <Link href="/scheduled-post" className="flex items-center gap-2 px-4 py-[8px] border-2 border-[#5046E5] text-[#5046E5] rounded-full text-lg font-medium hover:bg-[#5046E5] hover:text-white transition-colors">
              <FaClock className="text-sm" />
              Scheduled Post
            </Link>
          </div>
        </div>
        {publishedPostsLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5046E5]"></div>
            <p className="text-lg text-[#5F5F5F] mt-4">Loading published posts...</p>
          </div>
        )}

        {publishedPostsError && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-center max-w-md">
              <p className="text-lg text-red-600 leading-relaxed mb-4">
                Error loading posts: {publishedPostsError}
              </p>
            </div>
          </div>
        )}
        {!publishedPostsLoading && !publishedPostsError && (
          <div className="space-y-8">
            {/* Published Posts Section */}
            {filteredPublishedPosts.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold text-[#171717] mb-6">
                  Published Posts ({filteredPublishedPosts.length})
                  {selectedPlatform !== 'All' && ` - ${selectedPlatform}`}
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-6">
                  {filteredPublishedPosts.map((post, index) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    index={index}
                      selectedDay={getDefaultDay(post.id)}
                      selectedPlatform={selectedPlatform}
                    onDaySelect={(day) => handleDaySelect(post.id, day)}
                    onPlatformSelect={(platform) => handlePlatformSelect(post.id, platform)}
                  />
                ))}
              </div>
            </div>
            )}

          </div>
        )}

        {/* No Posts Message for Selected Platform */}  
        {!publishedPostsLoading && !publishedPostsError && filteredPublishedPosts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-center max-w-md">
              <div className="mb-4">
                {selectedPlatform === 'All' ? (
                  <div className="flex items-center justify-center mx-auto mb-4">
                    {emptyPlatformIcon}
                  </div>
                  
                ) : (
                  <div className="flex items-center justify-center w-14 h-14 mx-auto mb-4 bg-gray-100 rounded-full">
                    {getPlatformIcon(selectedPlatform)}
                  </div>
                )}
              </div>
              <h3 className="text-xl font-semibold text-[#282828] mb-3">
                {selectedPlatform === 'All' ? '' : `No ${selectedPlatform} Posts`}
              </h3>
              <p className="text-xl text-[#5F5F5F] leading-[24px]">
                {selectedPlatform === 'All' 
                  ? "You'll see your post stats pop up as soon as they're shared on your accounts!"
                  : `You don't have any posts published on ${selectedPlatform} yet. Try selecting a different platform or publish some content!`
                }
              </p>  
            </div>
          </div>
        )}
      </div>
      <ConnectAccountsModal
        isOpen={showConnectAccountsModal}
        onClose={handleConnectAccountsClose}
        onNext={handleConnectAccountsNext}
        buttonText="Done"
      />
    </div>
  );
}
