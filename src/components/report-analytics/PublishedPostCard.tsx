"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { FaRegThumbsUp, FaRegCommentDots, FaRegShareSquare, FaClock, FaPlay } from "react-icons/fa";
import { getPlatformIcon } from "./PlatformIcon";

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
  const getPlatformName = (accountType: string) => {
    if (accountType.includes('Instagram')) return 'Instagram';
    if (accountType.includes('Facebook')) return 'Facebook';
    if (accountType.includes('LinkedIn')) return 'LinkedIn';
    if (accountType.includes('YouTube')) return 'YouTube';
    if (accountType.includes('Twitter')) return 'Twitter';
    return 'Instagram';
  };

  const platformName = getPlatformName(post.account_type);


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
  const [thumbnailUrl1, setThumbnailUrl] = useState<string | null>(null);
  const insightsData = getInsightsData();
  useEffect(() => {
    const attachment = post.attachments?.[0];
    if (!attachment?.url) return;

    const url = attachment.url;

    if (
      attachment.mime?.includes("image") ||
      attachment.ext?.match(/(jpg|jpeg|png|gif|webp)$/i) ||
      url.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i)
    ) {
      setThumbnailUrl(url);
      return;
    }

    if (platformName === "YouTube" && post.permalink) {
      const match = post.permalink.match(
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
      );
      if (match?.[1]) {
        setThumbnailUrl(`https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`);
      }
      return;
    }

    if (
      attachment.mime?.includes("video") ||
      attachment.ext === "mp4" ||
      url.includes(".mp4")
    ) {
      try {
        const video = document.createElement("video");
        video.src = url;
        video.crossOrigin = "anonymous";
        video.muted = true;
        video.preload = "metadata";
        
        const handleLoadedData = () => {
          try {
            const canvas = document.createElement("canvas");
            canvas.width = video.videoWidth || 320;
            canvas.height = video.videoHeight || 240;
            const ctx = canvas.getContext("2d");
            
            if (ctx) {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              setThumbnailUrl(canvas.toDataURL("image/jpeg", 0.8));
            }
          } catch (canvasError) {
            // Silent fail
          }
        };

        video.addEventListener("loadeddata", handleLoadedData);
        video.addEventListener("error", () => {});
        
        return () => {
          video.removeEventListener("loadeddata", handleLoadedData);
          video.removeEventListener("error", () => {});
        };
      } catch (err) {
        // Silent fail
      }
    }
  }, [post.attachments, platformName, post.permalink]);
  return (
    <motion.div
      className="bg-white rounded-[10px] border border-[#F1F1F4] overflow-hidden p-4"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      style={{ boxShadow: "0px 5px 20px 0px #0000000D" }}
    >
      <div className="w-full aspect-video relative mb-4">
      {thumbnailUrl1 ? (
          <Image
            src={thumbnailUrl1}
            alt={post.content || "Video thumbnail"}
            fill
            className="object-cover rounded-[8px]"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/images/video-placeholder.jpg";
            }}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 rounded-[8px] flex items-center justify-center relative">
            <div className="text-gray-400 text-center">
              {getPlatformIcon(platformName)}
              <p className="text-sm mt-2">{platformName} {post.type === 'video' ? 'Video' : 'Content'}</p>
            </div>
            {post.type === 'video' && post.attachments?.[0]?.url && (
              <video
                src={post.attachments[0].url}
                className="absolute inset-0 w-full h-full object-cover rounded-[8px] opacity-30"
                muted
                loop
                playsInline
                onError={() => {}}
              />
            )}
            {post.type === 'video' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                  <FaPlay className="text-white text-xl ml-1" />
                </div>
              </div>
            )}
          </div>
        )}
        <div className="absolute top-2 right-2 bg-white bg-opacity-90 rounded-full px-2 py-1 flex items-center gap-1">
          {getPlatformIcon(platformName)}
          <span className="text-xs font-medium text-[#282828]">{platformName}</span>
        </div>
      </div>
      <div className="">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-medium text-[#282828] line-clamp-2 flex-1">
            {post.content || 'Post Content'}
          </h3>
          <div className="flex items-center font-medium gap-1 text-sm text-[#171717] ml-2 whitespace-nowrap">
            <FaClock className="text-xs" />
            <span>{formatDate(post.publish_at || post.created_at)}</span>
          </div>
        </div>
        <div className="mb-4">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${post.published
              ? 'bg-green-100 text-green-800'
              : post.draft
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-blue-100 text-blue-800'
            }`}>
            {post.published ? 'Published' : post.draft ? 'Draft' : 'Scheduled'}
          </span>
        </div>
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
      </div>
    </motion.div>
  );
};

export default PublishedPostCard;
