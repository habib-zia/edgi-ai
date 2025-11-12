"use client";
import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
	FaRegCommentDots,
	FaRegThumbsUp,
	FaRegShareSquare,
	FaPlayCircle,
} from "react-icons/fa";
import { getPlatformIcon } from "./PlatformIcon";

interface TopPostProps {
	topPost: any;
	topPostPlatform: string;
	selectedPlatform: string;
}

export default function TopPost({ topPost, topPostPlatform }: TopPostProps) {
	const [isPlaying, setIsPlaying] = useState(false);
	const videoRef = useRef<HTMLVideoElement>(null);

	const getPlatformName = (accountType: string) => {
		if (!accountType) return "Unknown";
		
		const platformMap: { [key: string]: string } = {
			"Instagram Business": "Instagram",
			"Instagram Personal": "Instagram", 
			"Facebook Page": "Facebook",
			"Facebook Profile": "Facebook",
			"X (Twitter) Account": "X",
			"LinkedIn Company": "LinkedIn",
			"LinkedIn Personal": "LinkedIn",
			"TikTok Business": "TikTok",
			"TikTok Personal": "TikTok",
			"YouTube Channel": "YouTube"
		};
		
		return platformMap[accountType] || accountType;
	};

	const handleVideoPlay = () => {
		setIsPlaying(true);
		if (videoRef.current) {
			videoRef.current.play();
		}
	};

	React.useEffect(() => {
		const generateThumbnail = () => {
			if (videoRef.current && topPost) {
				const video = videoRef.current;
				
				video.addEventListener('loadedmetadata', () => {
					video.currentTime = 1;
				});
				
				video.addEventListener('seeked', () => {
				});
			}
		};

		generateThumbnail();
	}, [topPost]);

	return (
		<motion.div
			className="bg-white rounded-[10px] h-fit px-[13px] py-[15px] flex flex-col items-start border border-[#F1F1F4] md:max-w-[303px] max-w-full w-full"
			initial={{ opacity: 0, y: 40 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, amount: 0.5 }}
			transition={{ duration: 0.7 }}
			style={{ boxShadow: "0px 5px 20px 0px #0000000D" }}
		>
			<h2 className="text-lg font-medium text-[#282828] mb-[13px]">Top Post</h2>
			
			<div className="w-full rounded-[8px] overflow-hidden mb-3 bg-gray-100 relative">
				{topPost?.account_type && (
					<div className="absolute top-2 right-2 z-5 bg-black bg-opacity-70 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
						{getPlatformIcon(getPlatformName(topPost.account_type))}
						<span className="text-white text-xs font-medium">
							{getPlatformName(topPost.account_type)}
						</span>
					</div>
				)}
				
				{(topPost?.type === 'video' && topPost?.attachments?.[0]?.url) || 
				 (topPost?.image && (topPost.image.includes('.mp4') || topPost.image.includes('.mov') || topPost.image.includes('.avi') || topPost.image.includes('.webm'))) ? (
					<div className="relative rounded-[8px] h-[155px] w-full overflow-hidden">
						<video
							ref={videoRef}
							src={topPost.attachments?.[0]?.url || topPost.image}
							className="absolute inset-0 w-full h-full object-cover rounded-[8px]"
							muted
							loop
							playsInline
							preload="metadata"
							controls={isPlaying}
							poster=""
							webkit-playsinline="true"
							onError={() => {}}
							onLoadStart={() => {}}
							onLoadedMetadata={() => {
								if (videoRef.current) {
									videoRef.current.currentTime = 1;
								}
							}}
						/>
						{!isPlaying && (
							<div 
								className="absolute inset-0 flex items-center justify-center z-5 cursor-pointer hover:bg-black hover:bg-opacity-20 transition-all duration-200"
								onClick={handleVideoPlay}
							>
								<div className="w-16 h-16 bg-black bg-opacity-80 rounded-full flex items-center justify-center">
									<FaPlayCircle className="text-white text-2xl" />
								</div>
							</div>
						)}
					</div>
				) : topPost && topPost.attachments && topPost.attachments[0] ? (
					<Image 
						src={topPost.attachments[0].url} 
						alt="Top Post" 
						width={208} 
						height={138} 
						className="object-cover w-full h-[155px]" 
					/>
				) : (
					<div className="w-full h-[155px] bg-gray-200 flex items-center justify-center">
						<svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M4 16L8 12L12 16L20 8" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
							<path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#9CA3AF" strokeWidth="2"/>
						</svg>
					</div>
				)}
			</div>
			
			<div className="text-lg font-semibold text-[#171717] mb-2">
				{topPost && topPost.content ? topPost.content.substring(0, 25) + (topPost.content.length > 25 ? "..." : "") : "--"}
			</div>
			
			<div className="flex items-center justify-between w-full mb-4 gap-2">
				<div className="flex items-center gap-2 text-sm text-[#171717] font-medium">
					<span>
						<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M6.9987 0.333374C10.6807 0.333374 13.6654 3.31804 13.6654 7.00004C13.6654 10.682 10.6807 13.6667 6.9987 13.6667C3.3167 13.6667 0.332031 10.682 0.332031 7.00004C0.332031 3.31804 3.3167 0.333374 6.9987 0.333374ZM6.9987 1.66671C5.58421 1.66671 4.22766 2.22861 3.22746 3.2288C2.22727 4.229 1.66536 5.58555 1.66536 7.00004C1.66536 8.41453 2.22727 9.77108 3.22746 10.7713C4.22766 11.7715 5.58421 12.3334 6.9987 12.3334C8.41319 12.3334 9.76974 11.7715 10.7699 10.7713C11.7701 9.77108 12.332 8.41453 12.332 7.00004C12.332 5.58555 11.7701 4.229 10.7699 3.2288C9.76974 2.22861 8.41319 1.66671 6.9987 1.66671ZM6.9987 3.00004C7.16199 3.00006 7.31959 3.06001 7.44161 3.16852C7.56364 3.27702 7.64159 3.42654 7.6607 3.58871L7.66536 3.66671V6.72404L9.47003 8.52871C9.5896 8.64868 9.65901 8.80966 9.66418 8.97896C9.66935 9.14826 9.60989 9.31318 9.49786 9.44023C9.38584 9.56727 9.22966 9.64691 9.06105 9.66297C8.89243 9.67904 8.72402 9.63031 8.59003 9.52671L8.52736 9.47137L6.52736 7.47137C6.42375 7.36767 6.35721 7.23271 6.33803 7.08737L6.33203 7.00004V3.66671C6.33203 3.4899 6.40227 3.32033 6.52729 3.1953C6.65232 3.07028 6.82189 3.00004 6.9987 3.00004Z" fill="#5F5F5F"/>
						</svg>
					</span>
					<span>
						{topPost && topPost.date ? 
							topPost.date : 
							topPost && (topPost.published_at || topPost.publish_at) ? 
								new Date(topPost.published_at || topPost.publish_at).toLocaleDateString('en-US', {
									day: 'numeric',
									month: 'short',
									year: 'numeric',
									hour: '2-digit',
									minute: '2-digit'
								}) : "--"
						}
					</span>
				</div>
				{topPost?.permalink && (
					<a
						href={topPost.permalink}
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

			<div className="w-full h-[1px] bg-[#AFAFAF] mb-4"></div>
			
			<div className="flex justify-between w-full">
				<div className="flex flex-col items-center gap-0">
					<span className="text-[10px] text-[#858999] font-medium">Likes</span>
					<div className="flex items-center gap-1">
						<FaRegThumbsUp className="text-sm text-[#282828]" />
						<span className="font-medium text-base text-[#282828]">
							{(() => {
								// Try platforms first (backward compatibility)
								if (topPost && topPost.platforms?.[topPostPlatform]?.engagement?.likes) {
									return topPost.platforms[topPostPlatform].engagement.likes.toLocaleString();
								}
								// Try insights array (API format)
								if (topPost && topPost.insights) {
									const likesInsight = topPost.insights.find((i: any) => i.type === 'like_count' || i.type === 'likes');
									if (likesInsight?.value) {
										return likesInsight.value.toLocaleString();
									}
								}
								return "--";
							})()}
						</span>
					</div>
				</div>
				<div className="flex flex-col items-center gap-0">
					<span className="text-[10px] text-[#858999] font-medium">Comments</span>
					<div className="flex items-center gap-1">
						<FaRegCommentDots className="text-sm text-[#282828]" />
						<span className="font-medium text-base text-[#282828]">
							{(() => {
								// Try platforms first (backward compatibility)
								if (topPost && topPost.platforms?.[topPostPlatform]?.engagement?.comments) {
									return topPost.platforms[topPostPlatform].engagement.comments.toLocaleString();
								}
								// Try insights array (API format)
								if (topPost && topPost.insights) {
									const commentsInsight = topPost.insights.find((i: any) => i.type === 'comments_count' || i.type === 'comments');
									if (commentsInsight?.value) {
										return commentsInsight.value.toLocaleString();
									}
								}
								return "--";
							})()}
						</span>
					</div>
				</div>
				<div className="flex flex-col items-center gap-0">
					<span className="text-[10px] text-[#858999] font-medium">Shares</span>
					<div className="flex items-center gap-1">
						<FaRegShareSquare className="text-sm text-[#282828]" />
						<span className="font-medium text-base text-[#282828]">
							{(() => {
								// Try platforms first (backward compatibility)
								if (topPost && topPost.platforms?.[topPostPlatform]?.engagement?.shares) {
									return topPost.platforms[topPostPlatform].engagement.shares.toLocaleString();
								}
								// Try insights array (API format)
								if (topPost && topPost.insights) {
									const sharesInsight = topPost.insights.find((i: any) => i.type === 'shares');
									if (sharesInsight?.value) {
										return sharesInsight.value.toLocaleString();
									}
								}
								return "--";
							})()}
						</span>
					</div>
				</div>
			</div>
		</motion.div>
	);
}
