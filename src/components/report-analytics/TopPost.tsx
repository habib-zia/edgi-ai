"use client";
import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
	FaRegCommentDots,
	FaRegThumbsUp,
	FaRegShareSquare,
} from "react-icons/fa";

interface TopPostProps {
	topPost: any;
	topPostPlatform: string;
	selectedPlatform: string;
}

export default function TopPost({ topPost, topPostPlatform }: TopPostProps) {
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
			
			{/* Post Image/Video */}
			<div className="w-full rounded-[8px] overflow-hidden mb-3 bg-gray-100">
				{(topPost?.type === 'video' && topPost?.attachments?.[0]?.url) || 
				 (topPost?.image && (topPost.image.includes('.mp4') || topPost.image.includes('.mov') || topPost.image.includes('.avi') || topPost.image.includes('.webm'))) ? (
					<div className="relative rounded-[8px] h-[155px] w-full overflow-hidden">
						<video
							src={topPost.attachments?.[0]?.url || topPost.image}
							className="w-full h-full object-cover"
							poster=""
							preload="metadata"
							onClick={(e) => {
								const video = e.currentTarget;
								if (video.paused) {
									video.play();
									video.controls = true;
								} else {
									video.pause();
									video.controls = false;
								}
							}}
						/>
						{/* Play Button Overlay */}
						<div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300 cursor-pointer">
							<div className="w-12 h-12 bg-white bg-opacity-90 rounded-full flex items-center justify-center shadow-lg">
								<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M8 5V19L19 12L8 5Z" fill="#282828"/>
								</svg>
							</div>
						</div>
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
			
			{/* Post Title */}
			<div className="text-lg font-semibold text-[#171717] mb-2">
				{topPost && topPost.content ? topPost.content.substring(0, 25) + (topPost.content.length > 25 ? "..." : "") : "--"}
			</div>
			
			{/* Date */}
			<div className="flex items-center gap-2 text-sm text-[#171717] mb-4 font-medium">
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

			{/* Separator */}
			<div className="w-full h-[1px] bg-[#AFAFAF] mb-4"></div>
			
			{/* Engagement Metrics */}
			<div className="flex justify-between w-full">
				<div className="flex flex-col items-center gap-0">
					<span className="text-[10px] text-[#858999] font-medium">Likes</span>
					<div className="flex items-center gap-1">
						<FaRegThumbsUp className="text-sm text-[#282828]" />
						<span className="font-medium text-base text-[#282828]">
							{topPost && topPost.platforms?.[topPostPlatform]?.engagement?.likes ? 
								topPost.platforms[topPostPlatform].engagement.likes.toLocaleString() :
								topPost && topPost.insights?.find((i: any) => i.type === 'likes')?.value ?
									topPost.insights.find((i: any) => i.type === 'likes').value.toLocaleString() : "--"}
						</span>
					</div>
				</div>
				<div className="flex flex-col items-center gap-0">
					<span className="text-[10px] text-[#858999] font-medium">Comments</span>
					<div className="flex items-center gap-1">
						<FaRegCommentDots className="text-sm text-[#282828]" />
						<span className="font-medium text-base text-[#282828]">
							{topPost && topPost.platforms?.[topPostPlatform]?.engagement?.comments ? 
								topPost.platforms[topPostPlatform].engagement.comments.toLocaleString() :
								topPost && topPost.insights?.find((i: any) => i.type === 'comments')?.value ?
									topPost.insights.find((i: any) => i.type === 'comments').value.toLocaleString() : "--"}
						</span>
					</div>
				</div>
				<div className="flex flex-col items-center gap-0">
					<span className="text-[10px] text-[#858999] font-medium">Shares</span>
					<div className="flex items-center gap-1">
						<FaRegShareSquare className="text-sm text-[#282828]" />
						<span className="font-medium text-base text-[#282828]">
							{topPost && topPost.platforms?.[topPostPlatform]?.engagement?.shares ? 
								topPost.platforms[topPostPlatform].engagement.shares.toLocaleString() :
								topPost && topPost.insights?.find((i: any) => i.type === 'shares')?.value ?
									topPost.insights.find((i: any) => i.type === 'shares').value.toLocaleString() : "--"}
						</span>
					</div>
				</div>
			</div>
		</motion.div>
	);
}
