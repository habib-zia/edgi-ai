"use client";
import React from "react";
import { motion } from "framer-motion";
import { FaRegThumbsUp, FaRegCommentDots, FaRegShareSquare, FaClock, FaPlay } from "react-icons/fa";
import { getPlatformIcon } from "../../utils/platformIcons";

interface PublishedPost {
  id: number;
  content: string;
  account_type: string;
  type: string;
  attachments: Array<{
    ext: string;
    mime: string;
    name: string;
    path: string;
    size: number;
    type: string;
    url: string;
  }>;
  publish_at: string;
  created_at: string;
  published_at: string | null;
  published: boolean;
  draft: boolean;
  permalink: string | null;
  insights: Array<{
    type: string;
    value: number;
  }> | null;
  account_details: {
    account_id: number;
    account_type: string;
    is_connected: boolean;
  };
}

interface PublishedPostCardProps {
  post: PublishedPost;
  index: number;
}

const PublishedPostCard: React.FC<PublishedPostCardProps> = ({ post, index }) => {
  // Get platform name from account_type
  const getPlatformName = (accountType: string) => {
    if (accountType.includes('Instagram')) return 'Instagram';
    if (accountType.includes('Facebook')) return 'Facebook';
    if (accountType.includes('LinkedIn')) return 'LinkedIn';
    if (accountType.includes('YouTube')) return 'YouTube';
    if (accountType.includes('Twitter')) return 'Twitter';
    return 'Instagram'; // default
  };
  
  const platformName = getPlatformName(post.account_type);
  
  
  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return dateString;
    }
  };

  // Get insights data
  const getInsightsData = () => {
    if (!post.insights || !Array.isArray(post.insights)) {
      return { likes: 0, comments: 0, shares: 0 };
    }

    const insights = post.insights.reduce((acc, insight) => {
      acc[insight.type] = insight.value;
      return acc;
    }, {} as Record<string, number>);

    return {
      likes: insights.likes || 0,
      comments: insights.comments || 0,
      shares: insights.shares || 0
    };
  };

  const insightsData = getInsightsData();

  // Function to get platform icon

  return (
    <motion.div
      className="bg-white rounded-[10px] border border-[#F1F1F4] overflow-hidden p-4"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      style={{ boxShadow: "0px 5px 20px 0px #0000000D" }}
    >
      {/* Thumbnail with Play Button */}
      <div className="w-full aspect-video relative mb-4 group">
        {/* <Image 
          src={getMediaUrl()} 
          alt={post.content || 'Post content'} 
          fill 
          className="object-cover rounded-[8px]"
        /> */}
        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-[8px] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-12 h-12 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
            <FaPlay className="text-[#5046E5] ml-1" />
          </div>
        </div>
        {/* Platform Badge */}
        <div className="absolute top-2 right-2 bg-white bg-opacity-90 rounded-full px-2 py-1 flex items-center gap-1">
          {getPlatformIcon(platformName)}
          <span className="text-xs font-medium text-[#282828]">{platformName}</span>
        </div>
      </div>

      {/* Content */}
      <div className="">
        {/* Post Title and Date */}
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-medium text-[#282828] line-clamp-2">
            {post.content || 'Post Content'}
          </h3>
          <div className="flex items-center font-medium gap-1 text-sm text-[#171717] ml-2">
            <FaClock className="text-xs" />
            <span>{formatDate(post.publish_at || post.created_at)}</span>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mb-4">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            post.published 
              ? 'bg-green-100 text-green-800' 
              : post.draft 
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-blue-100 text-blue-800'
          }`}>
            {post.published ? 'Published' : post.draft ? 'Draft' : 'Scheduled'}
          </span>
        </div>

        {/* Engagement Stats */}
        <div className="flex justify-between w-full px-2 py-3 bg-gray-50 rounded-lg">
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1">
              <FaRegThumbsUp className="text-sm text-[#282828]" />
              <span className="font-medium text-sm text-[#282828]">{insightsData.likes}</span>
            </div>
            <span className="text-[10px] text-[#858999] font-medium">Likes</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1">
              <FaRegCommentDots className="text-sm text-[#282828]" />
              <span className="font-medium text-sm text-[#282828]">{insightsData.comments}</span>
            </div>
            <span className="text-[10px] text-[#858999] font-medium">Comments</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1">
              <FaRegShareSquare className="text-sm text-[#282828]" />
              <span className="font-medium text-sm text-[#282828]">{insightsData.shares}</span>
            </div>
            <span className="text-[10px] text-[#858999] font-medium">Shares</span>
          </div>
        </div>

        {/* Post Details */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center text-sm text-[#858999]">
            <span>Account ID: {post.account_details.account_id}</span>
            <span className="capitalize">{post.type}</span>
          </div>
          {/* Debug Insights */}
          {post.insights && (
            <div className="mt-2 text-xs text-gray-500">
              Insights: {JSON.stringify(post.insights)}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default PublishedPostCard;
