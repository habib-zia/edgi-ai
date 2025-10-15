
"use client";
import React, { useEffect, useState } from "react";
import { FaLink, FaClock, FaTrash } from "react-icons/fa6";
import PostCard from "./PostCard";
import PublishedPostCard from "./PublishedPostCard";
import Link from "next/link";
import ScheduleDeleteModal from "../ui/schedule-delete-modal";
import ConnectAccountsModal from "../ui/connect-accounts-modal";
import { useRecentPosts } from "@/hooks/useRecentPosts";
import { recentPostsData } from "./SocialData";
import apiService from "@/lib/api-service";

// Mock data for recent posts with platform-specific data



export default function RecentPosts() {

  // Use the custom hook
  const {
    showDeleteModal,
    showConnectAccountsModal,
    scheduleData,
    scheduleLoading,
    selectedDays,
    selectedPlatforms,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
    handleAccountsClick,
    handleConnectAccountsClose,
    handleConnectAccountsNext,
    handleDaySelect,
    handlePlatformSelect
  } = useRecentPosts();
  
  const [publishedPosts, setPublishedPosts] = useState<any[]>([])
  const [publishedPostsLoading, setPublishedPostsLoading] = useState(false)
  const [publishedPostsError, setPublishedPostsError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchPublishedPosts()
  }, [])
  
  const fetchPublishedPosts = async () => {
    try {
      setPublishedPostsLoading(true)
      setPublishedPostsError(null)
      
      const response = await apiService.getPublishedPosts()
      
      
      if (response.success && response.data) {
        if (response.data.posts && Array.isArray(response.data.posts)) {
          setPublishedPosts(response.data.posts)
        } else {
          console.log('⚠️ No posts array found in response data')
          setPublishedPosts([])
        }
        
        setPublishedPostsError(null)
      } else {
        setPublishedPostsError(response.message || 'Failed to fetch published posts')
        setPublishedPosts([])
      }
    } catch (error: any) {
      console.error('💥 Error fetching published posts:', error)
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response
      })
      setPublishedPostsError(error.message || 'Failed to load published posts')
      setPublishedPosts([])
    } finally {
      setPublishedPostsLoading(false)
      console.log('🏁 Finished fetching published posts')
    }
  }
  console.log(publishedPosts?.length)
  return (
    <div className="w-full bg-white/90 py-14 px-2 md:px-8">
      <div className="max-w-[1260px] w-full mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
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
            {scheduleData && <button
              onClick={handleDeleteClick}
              className="flex items-center gap-2 px-4 py-[8px] border-2 border-[#FF3131] text-[#FF3131] bg-[#FF313110] rounded-full text-lg font-medium hover:bg-[#FF3131] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaTrash className="text-sm" />
              {scheduleLoading ? 'Loading...' : 'Schedule Delete'}
            </button>}
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
              <button
                onClick={fetchPublishedPosts}
                className="px-6 py-2 bg-[#5046E5] text-white rounded-full hover:bg-[#4338CA] transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
        {!publishedPostsLoading && !publishedPostsError && (
          <div className="space-y-8">
            {publishedPosts.length > 0 && (
              <div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {publishedPosts.map((post, index) => (
                    <PublishedPostCard
                      key={post.id}
                      post={post}
                      index={index}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Analytics Posts Section */}
            <div>
              <h2 className="text-2xl font-semibold text-[#171717] mb-6">Analytics Posts ({recentPostsData.length})</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {recentPostsData.map((post, index) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    index={index}
                    selectedDay={selectedDays[post.id]}
                    selectedPlatform={selectedPlatforms[post.id]}
                    onDaySelect={(day) => handleDaySelect(post.id, day)}
                    onPlatformSelect={(platform) => handlePlatformSelect(post.id, platform)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty State - only show if no posts at all */}
        {!publishedPostsLoading && !publishedPostsError && publishedPosts.length === 0 && recentPostsData.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <svg width="62" height="63" viewBox="0 0 62 63" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 8C0 3.58172 3.58172 0 8 0H53.3963C57.8145 0 61.3963 3.58172 61.3963 8V54.9309C61.3963 59.3492 57.8145 62.9309 53.3963 62.9309H8C3.58172 62.9309 0 59.3492 0 54.9309V8Z" fill="#EF9943" fillOpacity="0.1" />
              <path d="M16.3556 33.8842C16.1656 33.762 16.0517 33.5926 16.014 33.3759C15.9762 33.1592 16.0151 32.9526 16.1306 32.7559L20.8623 25.1659C21.3445 24.3859 22.0362 23.9665 22.9373 23.9076C23.8373 23.8487 24.5845 24.1642 25.179 24.8542L26.6756 26.5876C26.9112 26.8654 27.2051 26.9887 27.5573 26.9576C27.9095 26.9254 28.1712 26.7598 28.3423 26.4609L31.7556 20.9092C32.2667 20.067 33.014 19.6337 33.9973 19.6092C34.9817 19.5848 35.7428 19.9904 36.2806 20.8259L37.8623 23.2559C38.0756 23.5548 38.369 23.7042 38.7423 23.7042C39.1156 23.7042 39.399 23.5442 39.5923 23.2242L43.8756 16.3842C43.9967 16.1809 44.1773 16.0576 44.4173 16.0142C44.6573 15.9709 44.8762 16.0265 45.074 16.1809C45.2417 16.3031 45.3445 16.462 45.3823 16.6576C45.4201 16.8531 45.3812 17.0492 45.2656 17.2459L40.9823 24.0859C40.4723 24.9215 39.7251 25.3392 38.7406 25.3392C37.7562 25.3392 36.9951 24.9354 36.4573 24.1276L34.909 21.7609C34.6956 21.4409 34.4017 21.2865 34.0273 21.2976C33.654 21.3087 33.3706 21.4742 33.1773 21.7942L29.7656 27.3126C29.289 28.0926 28.5945 28.5192 27.6823 28.5926C26.7712 28.6648 26.019 28.3559 25.4256 27.6659L23.919 25.8909C23.6834 25.6131 23.3945 25.4898 23.0523 25.5209C22.7112 25.5542 22.4556 25.7198 22.2856 26.0176L17.5523 33.6509C17.4312 33.8531 17.2506 33.9815 17.0106 34.0359C16.7706 34.0904 16.5523 34.0398 16.3556 33.8842ZM35.9056 42.2876C37.2434 42.2876 38.374 41.8265 39.2973 40.9042C40.2206 39.982 40.6817 38.8509 40.6806 37.5109C40.6806 36.1742 40.2195 35.0442 39.2973 34.1209C38.3751 33.1976 37.2451 32.7365 35.9073 32.7376C34.5695 32.7387 33.439 33.1998 32.5156 34.1209C31.5923 35.042 31.1306 36.1726 31.1306 37.5126C31.1306 38.8526 31.5917 39.9826 32.514 40.9026C33.4362 41.8226 34.5673 42.2842 35.9073 42.2876M35.9073 43.9542C34.1229 43.9542 32.6028 43.3265 31.3473 42.0709C30.0917 40.8154 29.464 39.2959 29.464 37.5126C29.464 35.7292 30.0917 34.2092 31.3473 32.9526C32.6028 31.6959 34.1223 31.0681 35.9056 31.0692C37.689 31.0704 39.209 31.6981 40.4656 32.9526C41.7223 34.207 42.3501 35.727 42.349 37.5126C42.349 38.2559 42.2301 38.9626 41.9923 39.6326C41.7556 40.3026 41.4217 40.9081 40.9906 41.4492L45.0923 45.5826C45.2479 45.7381 45.3256 45.9242 45.3256 46.1409C45.3256 46.3576 45.2479 46.5431 45.0923 46.6976C44.9367 46.852 44.7456 46.9298 44.519 46.9309C44.2923 46.932 44.1012 46.8542 43.9456 46.6976L39.8106 42.5959C39.2695 43.027 38.6695 43.3615 38.0106 43.5992C37.3517 43.837 36.6506 43.9554 35.9073 43.9542Z" fill="#EF9943" />
            </svg>
            <div className="text-center max-w-md mt-8">
              <p className="text-lg text-[#5F5F5F] leading-relaxed">
                You&apos;ll see your post stats pop up as soon<br />
                as they&apos;re shared on your accounts!
              </p>
            </div>
          </div>
        )}
      </div>
      <ScheduleDeleteModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
      />
      <ConnectAccountsModal
        isOpen={showConnectAccountsModal}
        onClose={handleConnectAccountsClose}
        onNext={handleConnectAccountsNext}
        buttonText="Done"
      />
    </div>
  );
}
