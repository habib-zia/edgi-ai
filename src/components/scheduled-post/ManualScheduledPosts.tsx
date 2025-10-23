'use client';

import React from 'react';
import { Calendar, Clock, User, ExternalLink } from 'lucide-react';

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

interface ManualScheduledPostsProps {
  posts: ManualPost[];
}

const getPlatformIcon = (accountType: string) => {
  const iconClass = "w-6 h-6";
  
  switch (accountType) {
    case 'Instagram Business':
      return (
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg p-1.5">
          <svg className={iconClass} viewBox="0 0 24 24" fill="white">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        </div>
      );
    case 'LinkedIn Profile':
      return (
        <div className="bg-blue-600 rounded-lg p-1.5">
          <svg className={iconClass} viewBox="0 0 24 24" fill="white">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        </div>
      );
    case 'X (Twitter) Account':
      return (
        <div className="bg-black rounded-lg p-1.5">
          <svg className={iconClass} viewBox="0 0 24 24" fill="white">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        </div>
      );
    case 'TikTok Account':
      return (
        <div className="bg-black rounded-lg p-1.5">
          <svg className={iconClass} viewBox="0 0 24 24" fill="white">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
          </svg>
        </div>
      );
    case 'YouTube Channel':
      return (
        <div className="bg-red-600 rounded-lg p-1.5">
          <svg className={iconClass} viewBox="0 0 24 24" fill="white">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        </div>
      );
    default:
      return (
        <div className="bg-gray-500 rounded-lg p-1.5">
          <svg className={iconClass} viewBox="0 0 24 24" fill="white">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
      );
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: userTimezone
  });
};

const formatTime = (dateString: string) => {
  // Parse the date string and treat it as UTC
  // Format: "2025-10-23 11:50:00" -> "2025-10-23T11:50:00Z"
  const utcDateString = dateString.replace(' ', 'T') + 'Z';
  const date = new Date(utcDateString);
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  // Debug: Log the conversion process
  console.log('Input date string:', dateString);
  console.log('UTC date string:', utcDateString);
  console.log('Parsed date:', date);
  console.log('Date in UTC:', date.toISOString());
  console.log('User timezone:', userTimezone);
  
  const localTime = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: userTimezone
  });
  
  console.log('Converted local time:', localTime);
  return localTime;
};

const ManualPostCard: React.FC<{ post: ManualPost }> = ({ post }) => {
  const thumbnailUrl = post.attachments?.[0]?.url;
  const publishDate = formatDate(post.publish_at);
  const publishTime = formatTime(post.publish_at);
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  console.log('User timezone:', userTimezone);
  console.log('Original UTC time:', post.publish_at);
  console.log('Converted time:', publishTime);
  console.log('Post data:', post);
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-100">
        {thumbnailUrl ? (
          <video
            src={thumbnailUrl}
            className="w-full h-full object-cover"
            poster={thumbnailUrl}
            muted
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"/>
            </svg>
          </div>
        )}
        
        {/* Platform Icon */}
        <div className="absolute top-3 right-3">
          {getPlatformIcon(post.account_type)}
        </div>
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            post.published 
              ? 'bg-green-100 text-green-800' 
              : post.approved 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-yellow-100 text-yellow-800'
          }`}>
            {post.published ? 'Published' : post.approved ? 'Approved' : 'Pending'}
          </span>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
            {post.content || 'No caption'}
          </h3>
        </div>
        
        {/* Platform and User */}
        <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-gray-300">•</span>
          <span className="text-xs text-gray-500">{post.account_type}</span>

        </div>
        
        {/* Publish Date & Time */}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{publishDate}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{publishTime}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ManualScheduledPosts: React.FC<ManualScheduledPostsProps> = ({ posts }) => {
  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Manual Posts</h3>
        <p className="text-gray-500">You haven't scheduled any manual posts yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Manual Scheduled Posts</h2>
          <p className="text-gray-600 mt-1">Posts scheduled for manual publishing</p>
        </div>
        <div className="text-sm text-gray-500">
          {posts.length} {posts.length === 1 ? 'post' : 'posts'}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <ManualPostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default ManualScheduledPosts;
