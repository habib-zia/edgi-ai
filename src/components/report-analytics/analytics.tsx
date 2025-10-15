"use client";
import React from "react";
import { motion } from "framer-motion";
import FollowersChart from "./FollowersChart";
import TopPost from "./TopPost";
import { summary, getPlatformIcon, AnalyticsDashboardProps } from "./PlatformIcon";



const cardVariants = {
	hidden: { opacity: 0, y: 40 },
	visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1 } }),
};


export default function AnalyticsDashboard({ selectedPlatform, setSelectedPlatform, hasPosts = false, postsData = [], topPostsData, insightsLoading }: AnalyticsDashboardProps & { topPostsData?: any, insightsLoading?: boolean }) {


	const isEmptyState = !hasPosts;
	const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
	const dropdownRef = React.useRef<HTMLDivElement>(null);

	const platformOptions = ['All', 'Instagram', 'Facebook', 'X', 'LinkedIn', 'TikTok', 'YouTube'];

	const getPlatformVideoCounts = () => {
		if (!hasPosts || postsData.length === 0) {
			return {};
		}

		const counts: { [key: string]: number } = {};
		
		platformOptions.forEach(platform => {
			counts[platform] = 0;
		});

		postsData.forEach(post => {
			if (post.platforms) {
				Object.keys(post.platforms).forEach(platform => {
					if (platformOptions.includes(platform)) {
						counts[platform] = (counts[platform] || 0) + 1;
					}
				});
			}
		});

		counts['All'] = postsData.length;

		return counts;
	};

	const platformVideoCounts = getPlatformVideoCounts();

	const getPlatformMetrics = () => {
		
		if (!hasPosts || postsData.length === 0) {
			return {
				posts: "--",
				likes: "--", 
				comments: "--",
				shares: "--"
			};
		}

		const filteredPosts = postsData.filter(post => {
			if (selectedPlatform === 'All') {
				return post.platforms && Object.keys(post.platforms).length > 0;
			}
			
			if (post.platforms && post.platforms[selectedPlatform]) {
				return true;
			}
			return false;
		});


		let totalLikes = 0;
		let totalComments = 0;
		let totalShares = 0;

		filteredPosts.forEach(post => {
			if (selectedPlatform === 'All') {
				if (post.platforms) {
					Object.values(post.platforms).forEach((platformData: any) => {
						if (platformData.engagement) {
							totalLikes += platformData.engagement.likes || 0;
							totalComments += platformData.engagement.comments || 0;
							totalShares += platformData.engagement.shares || 0;
						}
					});
				}
			} else {
				if (post.platforms && post.platforms[selectedPlatform]) {
					const platformData = post.platforms[selectedPlatform];
					if (platformData.engagement) {
						totalLikes += platformData.engagement.likes || 0;
						totalComments += platformData.engagement.comments || 0;
						totalShares += platformData.engagement.shares || 0;
					}
				}
			}
			
			if (post.insights && Array.isArray(post.insights) && (!post.platforms || Object.keys(post.platforms).length === 0)) {
				post.insights.forEach((insight: any) => {
					if (insight.type === 'likes') totalLikes += insight.value || 0;
					if (insight.type === 'comments') totalComments += insight.value || 0;
					if (insight.type === 'shares') totalShares += insight.value || 0;
				});
			}
		});

		const metrics = {
			posts: filteredPosts.length.toString(),
			likes: totalLikes.toLocaleString(),
			comments: totalComments.toLocaleString(),
			shares: totalShares.toLocaleString()
		};

		return metrics;
	};

	const currentMetrics = getPlatformMetrics();

	// Get top performing post
	const getTopPost = () => {
		
		if (topPostsData && !insightsLoading && topPostsData.posts && topPostsData.posts.length > 0) {
			let topPost = null;
			let maxEngagement = 0;
			let hasAnyEngagement = false;
			
			topPostsData.posts.forEach((post: any) => {
				let totalEngagement = 0;
				if (post.insights && post.insights.length > 0) {
					hasAnyEngagement = true;
					post.insights.forEach((insight: any) => {
						totalEngagement += insight.value || 0;
					});
				}
				
				if (totalEngagement > maxEngagement) {
					maxEngagement = totalEngagement;
					topPost = post;
				}
			});
			
			if (!hasAnyEngagement && topPostsData.posts.length > 0) {
				topPost = topPostsData.posts[0];
			}
			
			return topPost;
		}
		
		if (!hasPosts || postsData.length === 0) {
			return null;
		}

		const filteredPosts = postsData.filter(post => {
			if (selectedPlatform === 'All') {
				return post.platforms && Object.keys(post.platforms).length > 0;
			}
			
			if (post.platforms && post.platforms[selectedPlatform]) {
				return true;
			}
			return false;
		});

		let topPost: any = null;
		let maxEngagement = 0;

		filteredPosts.forEach(post => {
			let totalEngagement = 0;
			
			if (selectedPlatform === 'All') {
				if (post.platforms) {
					Object.values(post.platforms).forEach((platformData: any) => {
						if (platformData.engagement) {
							totalEngagement += (platformData.engagement.likes || 0) + 
											  (platformData.engagement.comments || 0) + 
											  (platformData.engagement.shares || 0);
						}
					});
				}
			} else {
				if (post.platforms && post.platforms[selectedPlatform]) {
					const platformData = post.platforms[selectedPlatform];
					if (platformData.engagement) {
						totalEngagement += (platformData.engagement.likes || 0) + 
										  (platformData.engagement.comments || 0) + 
										  (platformData.engagement.shares || 0);
					}
				}
			}
			
			if (post.insights && Array.isArray(post.insights) && (!post.platforms || Object.keys(post.platforms).length === 0)) {
				post.insights.forEach((insight: any) => {
					totalEngagement += insight.value || 0;
				});
			}
			
			if (totalEngagement > maxEngagement) {
				maxEngagement = totalEngagement;
				topPost = post;
			}
		});
		return topPost;
	};

	const topPost = getTopPost();
	
	const getTopPostPlatform = () => {
		if (!topPost) return selectedPlatform;
		if (selectedPlatform === 'All') {
			return Object.keys(topPost.platforms || {})[0] || selectedPlatform;
		}
		return selectedPlatform;
	};
	
	const topPostPlatform = getTopPostPlatform();

	React.useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsDropdownOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	return (
		<div className="w-full bg-white/90 py-8 px-2 md:px-8 flex flex-col items-center">
			{/* Header */}
			<div className="max-w-[1260px] w-full mx-auto">
				<h1 className="text-3xl md:text-[42px] font-semibold text-center text-[#171717] mb-4">Reports and Analytics</h1>
				<p className="text-center text-[#5F5F5F] text-xl mb-8">
				Track engagement and reach on your latest content.
					</p>
				
				{/* Global Platform Filter - Hide when no data */}
				{hasPosts && postsData.length > 0 && (
					<div className="flex md:flex-row flex-col gap-y-3 justify-between items-center md:mb-2 mb-5">
						<h2 className="md:text-[40px] text-[28px] font-semibold text-[#171717]">Recent Stats</h2>
						<div className="relative" ref={dropdownRef}>
							<div 
								className="flex items-center gap-3 px-4 py-[6px] bg-[#EEEEEE] rounded-lg cursor-pointer hover:bg-gray-50 transition-all duration-300"
								onClick={() => setIsDropdownOpen(!isDropdownOpen)}
							>
								{selectedPlatform === 'All' ? (
									<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
										<circle cx="10" cy="10" r="8" fill="#5046E5"/>
										<path d="M6 10L8.5 12.5L14 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
									</svg>
								) : (
									getPlatformIcon(selectedPlatform)
								)}
								<span className="text-lg font-medium text-[#282828]">{selectedPlatform}</span>
								<svg width="18" height="9" className={`text-sm text-[#858999] transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 18 9" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M8.77865 9.00009L0.445312 0.111206H17.112L8.77865 9.00009Z" fill="#ACACAC"/>
								</svg>
							</div>
						
							{isDropdownOpen && (
								<div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 bg-white border border-[#F1F1F4] rounded-lg shadow-lg z-10 min-w-[200px]">
									{platformOptions.map((platform) => (
										<div
											key={platform}
											className={`flex items-center gap-3 px-4 py-3 text-sm cursor-pointer hover:bg-gray-50 transition-colors ${
												platform === selectedPlatform ? 'text-[#5046E5] bg-[#5046E510]' : 'text-[#282828]'
											}`}
											onClick={() => {
												setSelectedPlatform(platform);
												setIsDropdownOpen(false);
											}}
										>
											{platform === 'All' ? (
												<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
													<circle cx="10" cy="10" r="8" fill="#5046E5"/>
													<path d="M6 10L8.5 12.5L14 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
												</svg>
											) : (
												getPlatformIcon(platform)
											)}
											<span className="font-medium">{platform}</span>
											<span className="ml-auto text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
												{platformVideoCounts[platform] || 0}
											</span>
										</div>
									))}
								</div>
							)}
						</div>
					</div>
				)}
				
				{/* Show empty state design when no posts */}
				{isEmptyState ? (
					<div className="flex flex-col items-center justify-center py-20">
						<div className="text-center max-w-md">
							<div className="mb-6">
								<svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto text-gray-400">
									<path d="M4 16L8 12L12 16L20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
									<path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
								</svg>
							</div>
							<h3 className="text-xl font-semibold text-[#282828] mb-3">
								No Posts Found
							</h3>
							<p className="text-lg text-[#5F5F5F] leading-relaxed">
								You&apos;ll see your post stats pop up as soon as they&apos;re shared on your accounts!
							</p>
						</div>
					</div>
				) : (
					<>
				{/* Information Banner for Empty State */}
				{isEmptyState && (
					<div className="bg-[#EF99431A] rounded-lg px-4 py-2 mb-8 max-w-fit mx-auto">
						<p className="text-center text-[#EF9943] text-lg font-normal">
							Your content is lined up and stats will be updated after 24 hours
						</p>
					</div>
				)}
				{/* Summary Cards */}
				<div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 justify-center gap-4 mb-8">
					{summary.map((item, i) => {
						// Get the appropriate value based on the item label
						let displayValue = item.value;
						if (item.label === "Total Posts") displayValue = currentMetrics.posts;
						else if (item.label === "Total Likes") displayValue = currentMetrics.likes;
						else if (item.label === "Total Comments") displayValue = currentMetrics.comments;
						else if (item.label === "Total Shares") displayValue = currentMetrics.shares;

						return (
						<motion.div
							key={item.label}
								className="bg-white rounded-[10px] p-[13px] flex justify-between items-center border border-[#F1F1F4] lg:max-w-[303px] max-w-full w-full"
							custom={i}
							initial="hidden"
							whileInView="visible"
							viewport={{ once: true, amount: 0.5 }}
							variants={cardVariants}
							style={{ boxShadow: "0px 5px 20px 0px #0000000D" }}
						>
							<div className="flex flex-col items-start w-full gap-2">
									<span className="text-base font-normal text-[#5F5F5F]">
										{selectedPlatform === 'All' ? item.label : `${selectedPlatform} ${item.label.replace('Total ', '')}`}
									</span>
									<div className="text-xl md:text-[24px] font-medium text-[#282828]">{isEmptyState ? "--" : displayValue}</div>
							</div>
							<div className="flex items-center justify-end w-full gap-2">
								<div className="flex items-center gap-2 text-gray-400 mb-2 bg-[#5046E51A] w-[40px] h-[40px] rounded-[4px] justify-center">{item.icon}</div>
							</div>
						</motion.div>
						);
					})}
				</div>
				{/* Main Content Grid */}
				<div className="grid grid-cols-12 gap-4">
					<div className="lg:col-span-9 col-span-12">
					{/* Followers Chart */}
					    <FollowersChart 
					    	isEmptyState={isEmptyState} 
					    	selectedPlatform={selectedPlatform} 
					    	totalLikes={topPostsData ? topPostsData.totalLikes : (parseInt(currentMetrics.likes.replace(/,/g, '')) || 0)}
					    	topPostData={topPost}
					    	insightsData={topPostsData}
					    />
					</div>
					<div className="flex md:flex-row flex-col gap-2 lg:col-span-3 col-span-12">
						{/* Top Post Component */}
						<TopPost 
							topPost={topPost}
							topPostPlatform={topPostPlatform}
							selectedPlatform={selectedPlatform}
						/>
					</div>
				</div>
					</>
				)}
			</div>
		</div>
	);
}
