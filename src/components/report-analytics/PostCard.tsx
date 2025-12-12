"use client";
import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { FaRegThumbsUp, FaRegThumbsDown, FaRegCommentDots, FaRegShareSquare, FaClock, FaPlayCircle } from "react-icons/fa";
import { getPlatformIcon, PostCardProps } from "./PlatformIcon";
import { convertUTCToLocalDate, convertUTCToLocalTime } from "@/utils/dateTimeUtils";


const PostCard: React.FC<PostCardProps> = ({ post, index, selectedPlatform }) => {
  const [isVideoPlaying, setIsVideoPlaying] = React.useState(false);
  const [isMediaLoading, setIsMediaLoading] = React.useState(true);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const actualPlatform = selectedPlatform === 'All' ? Object.keys(post.platforms)[0] : selectedPlatform;
  const currentPlatformData = post.platforms[actualPlatform];

  // Helper function to get insight value from post.insights array
  const getInsightValue = (type: string): number => {
    if (!post.insights || !Array.isArray(post.insights)) return 0;
    const insight = post.insights.find((i: any) => i.type === type);
    return insight?.value || 0;
  };

  const getPlatformMetrics = (platform: string, platformData: any) => {
    const metrics: Array<{ label: string; value: any; icon?: React.ReactNode }> = [];

    switch (platform) {
      case 'Instagram':
        metrics.push(
          { label: 'Reach', value: platformData?.metrics?.reach?.value || 0 },
          { label: 'Interactions', value: platformData?.metrics?.impression?.value || 0 },
          { label: 'Saved By', value: platformData?.metrics?.engagement?.value || 0 }
        );
        break;
      case 'Facebook':
        metrics.push(
          { label: 'Post Clicks', value: platformData?.metrics?.engagement?.value || 0 },
          { label: 'Impression', value: platformData?.metrics?.impression?.value || 0 },
          { label: 'Impressions', value: platformData?.metrics?.reach?.value || 0 }
        );
        break;
      case 'LinkedIn':
        metrics.push(
          { label: 'Clicks', value: platformData?.metrics?.reach?.value || 0 },
          { label: 'Impression', value: platformData?.metrics?.impression?.value || 0 },
          { label: 'Engagement', value: platformData?.metrics?.engagement?.value || 0 }
        );
        break;
      case 'X':
        metrics.push(
          { label: 'Impressions', value: platformData?.metrics?.impression?.value || getInsightValue('impressions') || 0 },
          { label: 'Likes', value: platformData?.engagement?.likes || getInsightValue('likes') || 0 },
          { label: 'Retweets', value: platformData?.engagement?.shares || getInsightValue('retweets') || 0 }
        );
        break;
      case 'TikTok':
        metrics.push(
          { label: 'Reach', value: platformData?.metrics?.reach?.value || 0 },
          { label: 'Impression', value: platformData?.metrics?.impression?.value || 0 },
          { label: 'Engagement', value: platformData?.metrics?.engagement?.value || 0 }
        );
        break;
      case 'YouTube':
        metrics.push(
          { label: 'Views', value: platformData?.metrics?.reach?.value || 0 }
        );
        break;
      default:
        metrics.push(
          { label: 'Reach', value: platformData?.metrics?.reach?.value || 0 },
          { label: 'Impression', value: platformData?.metrics?.impression?.value || 0 },
          { label: 'Engagement', value: platformData?.metrics?.engagement?.value || 0 }
        );
    }

    return metrics;
  };

  const getPlatformEngagement = (platform: string, platformData: any) => {
    const engagement = [];

    switch (platform) {
      case 'Instagram':
        engagement.push(
          { label: 'Likes', value: platformData?.engagement?.likes || 0, icon: <FaRegThumbsUp className="text-sm text-[#282828]" /> },
          { label: 'Comments', value: platformData?.engagement?.comments || 0, icon: <FaRegCommentDots className="text-sm text-[#282828]" /> },
          { label: 'Shares', value: platformData?.engagement?.shares || 0, icon: <FaRegShareSquare className="text-sm text-[#282828]" /> }
        );
        break;
      case 'Facebook':
        engagement.push(
          { label: 'Reactions', value: platformData?.engagement?.likes || 0, icon: <FaRegThumbsUp className="text-sm text-[#282828]" /> },
          { label: 'Comments', value: platformData?.engagement?.comments || 0, icon: <FaRegCommentDots className="text-sm text-[#282828]" /> },
          { label: 'Shares', value: platformData?.engagement?.shares || 0, icon: <FaRegShareSquare className="text-sm text-[#282828]" /> }
        );
        break;
      case 'LinkedIn':
        engagement.push(
          { label: 'Likes', value: platformData?.engagement?.likes || 0, icon: <FaRegThumbsUp className="text-sm text-[#282828]" /> },
          { label: 'Comments', value: platformData?.engagement?.comments || 0, icon: <FaRegCommentDots className="text-sm text-[#282828]" /> },
          { label: 'Shares', value: platformData?.engagement?.shares || 0, icon: <FaRegShareSquare className="text-sm text-[#282828]" /> }
        );
        break;
      case 'X':
        engagement.push(
          { label: 'Replies', value: getInsightValue('replies') || 0, icon: <FaRegCommentDots className="text-sm text-[#282828]" /> },
          { label: 'Quote Tweets', value: getInsightValue('quote_tweets') || 0, icon: <FaRegShareSquare className="text-sm text-[#282828]" /> }
        );
        break;
      case 'TikTok':
        engagement.push(
          { label: 'Likes', value: platformData?.engagement?.likes || 0, icon: <FaRegThumbsUp className="text-sm text-[#282828]" /> },
          { label: 'Comments', value: platformData?.engagement?.comments || 0, icon: <FaRegCommentDots className="text-sm text-[#282828]" /> },
          { label: 'Shares', value: platformData?.engagement?.shares || 0, icon: <FaRegShareSquare className="text-sm text-[#282828]" /> }
        );
        break;
      case 'YouTube':
        engagement.push(
          { label: 'Likes', value: platformData?.engagement?.likes || 0, icon: <FaRegThumbsUp className="text-sm text-[#282828]" /> },
          { label: 'Comments', value: platformData?.engagement?.comments || 0, icon: <FaRegCommentDots className="text-sm text-[#282828]" /> },
          { label: 'Dislikes', value: platformData?.engagement?.dislikes || 0, icon: <FaRegThumbsDown className="text-sm text-[#282828]" /> }
        );
        break;
      default:
        engagement.push(
          { label: 'Likes', value: platformData?.engagement?.likes || 0, icon: <FaRegThumbsUp className="text-sm text-[#282828]" /> },
          { label: 'Comments', value: platformData?.engagement?.comments || 0, icon: <FaRegCommentDots className="text-sm text-[#282828]" /> },
          { label: 'Shares', value: platformData?.engagement?.shares || 0, icon: <FaRegShareSquare className="text-sm text-[#282828]" /> }
        );
    }

    return engagement;
  };

  const handleVideoPlay = () => {
    setIsVideoPlaying(true);
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  React.useEffect(() => {
    setIsMediaLoading(true);
  }, [post]);

  // Generate thumbnail for iOS compatibility using video poster
  React.useEffect(() => {
    const generateThumbnail = () => {
      if (videoRef.current && post) {
        const video = videoRef.current;
        video.addEventListener('loadedmetadata', () => {
          video.currentTime = 1;
        });

        video.addEventListener('seeked', () => {
        });
      }
    };

    generateThumbnail();
  }, [post]);
  const date = convertUTCToLocalDate(post.date); // "Oct 23, 2025"
  const time = convertUTCToLocalTime(post.date); // "4:50 PM"
  return (
    <>
      {isMediaLoading && (
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes shimmer {
              0% {
                transform: translateX(-100%);
              }
              100% {
                transform: translateX(100%);
              }
            }
          `
        }} />
      )}
    <motion.div
      className="bg-white hover:bg-gray-100 transition-all duration-300 rounded-[10px] border border-[#F1F1F4] overflow-visible p-4"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      style={{ boxShadow: "0px 5px 20px 0px #0000000D" }}
    >
      <div className="w-full relative mb-4">
        {(post.type === 'video' && post.attachments?.[0]?.url) ||
          (post.image && (post.image.includes('.mp4') || post.image.includes('.mov') || post.image.includes('.avi') || post.image.includes('.webm'))) ? (
          <div className="relative rounded-[8px] h-[200px] w-full overflow-hidden">
            <video
              ref={videoRef}
              src={post.attachments?.[0]?.url || post.image}
              className="absolute inset-0 w-full h-full object-cover rounded-[8px]"
              muted
              loop
              playsInline
              preload="metadata"
              controls={isVideoPlaying}
              poster=""
              webkit-playsinline="true"
              onError={() => {
                setIsMediaLoading(false);
              }}
              onLoadStart={() => {
                setIsMediaLoading(true);
              }}
              onLoadedMetadata={() => {
                // Set video to show first frame for thumbnail on iOS
                if (videoRef.current) {
                  videoRef.current.currentTime = 1;
                }
                setIsMediaLoading(false);
              }}
            />
            {isMediaLoading && (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 rounded-[8px] overflow-hidden z-10">
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  style={{
                    animation: 'shimmer 1.5s infinite'
                  }}
                />
              </div>
            )}
            {!isVideoPlaying && (
              <div
                className="absolute inset-0 flex items-center justify-center z-20 cursor-pointer hover:bg-black hover:bg-opacity-20 transition-all duration-200"
                onClick={handleVideoPlay}
              >
                <div className="w-16 h-16 bg-black bg-opacity-80 rounded-full flex items-center justify-center">
                  <FaPlayCircle className="text-white text-2xl" />
                </div>
              </div>
            )}
          </div>
        ) : post.image ? (
          <div className="relative rounded-[8px] h-[200px] w-full overflow-hidden">
            <Image
              src={post.image}
              alt={post.name}
              width={208}
              height={138}
              className="object-cover rounded-[8px] h-[200px] w-full"
              onLoadStart={() => setIsMediaLoading(true)}
              onLoad={() => setIsMediaLoading(false)}
              onError={() => setIsMediaLoading(false)}
            />
            {isMediaLoading && (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 rounded-[8px] overflow-hidden z-10">
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  style={{
                    animation: 'shimmer 1.5s infinite'
                  }}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center bg-gray-100 rounded-[8px] h-[165px] w-full">
            <span className="text-gray-400 text-sm">No media available</span>
          </div>
        )}
      </div>

      <div className="">
        <div className="flex flex-col justify-between items-start mb-4 gap-y-2">
          <h3 className="text-lg font-medium text-[#282828]" style={{ wordBreak: 'break-word' }}>{post.name}</h3>
          <div className="flex w-full items-center justify-between gap-2">
            <div className="flex w-fit items-center font-medium gap-1 text-sm text-[#171717]">
              <FaClock className="text-xs" />
              <span>{date} {time}</span>
            </div>
            {post.permalink && (
              <a
                href={post.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-[#5046E5] hover:text-[#4338CA] font-medium transition-colors underline"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M15 3h6v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10 14L21 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                View Post
              </a>
            )}
          </div>
        </div>
        <div className="mb-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-base font-semibold text-[#282828]">Post Performance</h4>
            <div className="flex items-center gap-2 px-3 py-2 bg-[#EEEEEE] rounded-[7px]">
              {getPlatformIcon(actualPlatform)}
              <span className="text-base font-medium text-[#282828]">{actualPlatform}</span>
            </div>
          </div>
        </div>
        <div className="w-full mb-4">
          {(() => {
            const metrics = getPlatformMetrics(actualPlatform, currentPlatformData);
            const rows = [];

            // Create rows of 3 metrics each
            for (let i = 0; i < metrics.length; i += 3) {
              const rowMetrics = metrics.slice(i, i + 3);
              rows.push(
                <div key={i} className="flex justify-between items-center w-full gap-3">
                  {rowMetrics.map((metric, index) => (
                    <div key={index} className={`${index === 0 ? 'text-left' : index === 1 ? '!text-center' : '!text-right'} flex-1`}>
                      <div className="text-[10px] text-[#858999] font-medium mb-[2px]">{metric.label}</div>
                      <div className={`text-base font-medium text-[#282828] mb-[2px] flex items-center ${index === 0 ? 'justify-start' : index === 1 ? 'justify-center' : 'justify-end'} gap-1`}>
                        {metric.icon && metric.icon}
                        {metric.value.toLocaleString()}
                      </div>
                    </div>
                  ))}
                  {/* Fill remaining space if row has less than 3 metrics */}
                  {rowMetrics.length < 3 && Array.from({ length: 3 - rowMetrics.length }).map((_, index) => (
                    <div key={`empty-${index}`} className="flex-1"></div>
                  ))}
                </div>
              );
            }
            return rows;
          })()}
        </div>

        {/* Separator Line */}
        {getPlatformEngagement(actualPlatform, currentPlatformData).length > 0 && (
          <>
            <div className="w-full h-[1px] bg-[#AFAFAF] mb-4"></div>

            {/* Platform-Specific Engagement Details */}
            <div className="flex justify-between w-full">
              {getPlatformEngagement(actualPlatform, currentPlatformData).map((item, index) => (
                <div key={index} className={`flex flex-col ${index === 0 ? 'items-start' : index === getPlatformEngagement(actualPlatform, currentPlatformData).length - 1 ? 'items-end' : 'items-center'} gap-0 ${index === 1 ? 'mr-0' : ''}`}>
                  <span className="text-[10px] text-[#858999] font-medium">{item.label}</span>
                  <div className="flex items-center gap-1">
                    {item.icon}
                    <span className="font-medium text-base text-[#282828]">
                      {item.value.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

      </div>
    </motion.div>
    </>
  );
};

export default PostCard;
