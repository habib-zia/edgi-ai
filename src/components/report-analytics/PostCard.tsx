"use client";
import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { FaRegThumbsUp, FaRegCommentDots, FaRegShareSquare, FaChevronDown, FaClock } from "react-icons/fa";
import MiniPerformanceChart from "./MiniPerformanceChart";

interface PostData {
  id: number;
  image: string;
  name: string;
  date: string;
  platforms: {
    [key: string]: {
      performanceData: Array<{
        day: string;
        value: number;
      }>;
      metrics: {
        reach: { value: number; change: number };
        impression: { value: number; change: number };
        engagement: { value: number; change: number };
      };
      engagement: {
        likes: number;
        comments: number;
        shares: number;
      };
    };
  };
}

interface PostCardProps {
  post: PostData;
  index: number;
  selectedDay: string;
  selectedPlatform: string;
  onDaySelect: (day: string) => void;
  onPlatformSelect: (platform: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, index, selectedDay, selectedPlatform, onDaySelect, onPlatformSelect }) => {
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const platformOptions = ['Instagram', 'Facebook', 'Twitter'];
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  
  const currentPlatformData = post.platforms[selectedPlatform];

  // Function to get platform icon
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'Instagram':
        return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#clip0_8552_3665)">
        <path d="M10 20C4.478 20 0 15.522 0 10C0 4.478 4.478 0 10 0C15.522 0 20 4.478 20 10C20 15.522 15.522 20 10 20Z" fill="url(#paint0_linear_8552_3665)"/>
        <path d="M9.99987 4.40395C11.8219 4.40395 12.0379 4.40995 12.7579 4.44395C13.4239 4.47395 13.7859 4.58595 14.0259 4.67995C14.3439 4.80395 14.5719 4.95195 14.8099 5.18995C15.0479 5.42795 15.1959 5.65595 15.3199 5.97395C15.4139 6.21395 15.5239 6.57595 15.5559 7.24195C15.5879 7.96195 15.5959 8.17795 15.5959 9.99995C15.5959 11.8219 15.5899 12.038 15.5559 12.7579C15.5259 13.424 15.4139 13.7859 15.3199 14.0259C15.1959 14.3439 15.0479 14.5719 14.8099 14.8099C14.5719 15.0479 14.3439 15.1959 14.0259 15.32C13.7859 15.4139 13.4239 15.5239 12.7579 15.5559C12.0379 15.5879 11.8219 15.5959 9.99987 15.5959C8.17787 15.5959 7.96187 15.5899 7.24187 15.5559C6.57588 15.5259 6.21388 15.4139 5.97388 15.32C5.65587 15.1959 5.42787 15.0479 5.18987 14.8099C4.95187 14.5719 4.80387 14.3439 4.67987 14.0259C4.58587 13.7859 4.47587 13.424 4.44387 12.7579C4.41187 12.038 4.40387 11.8219 4.40387 9.99995C4.40387 8.17795 4.40987 7.96195 4.44387 7.24195C4.47387 6.57595 4.58587 6.21395 4.67987 5.97395C4.80387 5.65595 4.95187 5.42795 5.18987 5.18995C5.42787 4.95195 5.65587 4.80395 5.97388 4.67995C6.21388 4.58595 6.57588 4.47595 7.24187 4.44395C7.96187 4.40995 8.17787 4.40395 9.99987 4.40395ZM9.99987 3.17395C8.14587 3.17395 7.91387 3.18195 7.18587 3.21595C6.45987 3.24995 5.96387 3.36395 5.52787 3.53395C5.07987 3.70595 4.69787 3.93995 4.31987 4.31995C3.93987 4.69995 3.70788 5.07995 3.53187 5.52995C3.36388 5.96395 3.24787 6.45995 3.21387 7.18795C3.17987 7.91595 3.17188 8.14795 3.17188 10.002C3.17188 11.856 3.17987 12.0879 3.21387 12.8159C3.24787 13.5419 3.36187 14.0379 3.53187 14.474C3.70587 14.9199 3.93987 15.3019 4.31987 15.6799C4.69987 16.0599 5.07987 16.292 5.52987 16.4679C5.96387 16.636 6.45987 16.7519 7.18787 16.7859C7.91587 16.8199 8.14787 16.828 10.0019 16.828C11.8559 16.828 12.0879 16.8199 12.8159 16.7859C13.5419 16.7519 14.0379 16.6379 14.4739 16.4679C14.9199 16.294 15.3019 16.0599 15.6799 15.6799C16.0599 15.2999 16.2919 14.9199 16.4679 14.4699C16.6359 14.0359 16.7519 13.5399 16.7859 12.8119C16.8199 12.0839 16.8279 11.852 16.8279 9.99795C16.8279 8.14395 16.8199 7.91195 16.7859 7.18395C16.7519 6.45795 16.6379 5.96195 16.4679 5.52595C16.2939 5.07995 16.0599 4.69795 15.6799 4.31995C15.2999 3.93995 14.9199 3.70795 14.4699 3.53195C14.0359 3.36395 13.5399 3.24795 12.8119 3.21395C12.0859 3.18195 11.8539 3.17395 9.99987 3.17395Z" fill="white"/>
        <path d="M10.0001 6.4939C8.06414 6.4939 6.49414 8.0639 6.49414 9.9999C6.49414 11.9359 8.06414 13.5059 10.0001 13.5059C11.9361 13.5059 13.5061 11.9359 13.5061 9.9999C13.5061 8.0639 11.9361 6.4939 10.0001 6.4939ZM10.0001 12.2759C8.74414 12.2759 7.72414 11.2579 7.72414 9.9999C7.72414 8.7419 8.74414 7.7239 10.0001 7.7239C11.2561 7.7239 12.2761 8.7419 12.2761 9.9999C12.2761 11.2579 11.2561 12.2759 10.0001 12.2759Z" fill="white"/>
        <path d="M13.6442 7.17601C14.0971 7.17601 14.4642 6.80888 14.4642 6.35601C14.4642 5.90314 14.0971 5.53601 13.6442 5.53601C13.1913 5.53601 12.8242 5.90314 12.8242 6.35601C12.8242 6.80888 13.1913 7.17601 13.6442 7.17601Z" fill="white"/>
        </g>
        <defs>
        <linearGradient id="paint0_linear_8552_3665" x1="2.92893" y1="17.0711" x2="17.0711" y2="2.92893" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFD521"/>
        <stop offset="0.0551048" stopColor="#FFD020"/>
        <stop offset="0.1241" stopColor="#FEC01E"/>
        <stop offset="0.2004" stopColor="#FCA71B"/>
        <stop offset="0.2821" stopColor="#FA8316"/>
        <stop offset="0.3681" stopColor="#F85510"/>
        <stop offset="0.4563" stopColor="#F51E09"/>
        <stop offset="0.5" stopColor="#F30005"/>
        <stop offset="0.5035" stopColor="#F20007"/>
        <stop offset="0.5966" stopColor="#E1003B"/>
        <stop offset="0.6879" stopColor="#D30067"/>
        <stop offset="0.7757" stopColor="#C70088"/>
        <stop offset="0.8589" stopColor="#BF00A0"/>
        <stop offset="0.9357" stopColor="#BB00AF"/>
        <stop offset="1" stopColor="#B900B4"/>
        </linearGradient>
        <clipPath id="clip0_8552_3665">
        <rect width="20" height="20" fill="white"/>
        </clipPath>
        </defs>
        </svg>;
      case 'Facebook':
        return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#clip0_8552_3653)">
        <path fillRule="evenodd" clipRule="evenodd" d="M17.5565 0C18.9051 0 20 1.09492 20 2.44352V17.5565C20 18.9051 18.9051 20 17.5565 20H13.3976V12.4643H15.9991L16.4941 9.23688H13.3976V7.14246C13.3976 6.25953 13.8301 5.39887 15.2171 5.39887H16.625V2.65121C16.625 2.65121 15.3473 2.43316 14.1257 2.43316C11.5754 2.43316 9.90852 3.97883 9.90852 6.77707V9.23688H7.07363V12.4643H9.90852V20H2.44352C1.09492 20 0 18.9051 0 17.5565V2.44352C0 1.09492 1.09488 0 2.44352 0L17.5565 0Z" fill="#1777F2"/>
        </g>
        <defs>
        <clipPath id="clip0_8552_3653">
        <rect width="20" height="20" rx="1" fill="white"/>
        </clipPath>
        </defs>
        </svg>;
      case 'Twitter':
        return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#clip0_8552_3659)">
        <path d="M11.7459 8.59711L18.5716 0.833374H16.9544L11.0249 7.57311L6.29252 0.833374H0.833008L7.99091 11.026L0.833008 19.1667H2.45027L8.70808 12.0477L13.7068 19.1667H19.1663L11.7459 8.59711ZM9.53011 11.1154L8.80376 10.0998L3.0335 2.02638H5.51795L10.1761 8.54434L10.8994 9.55993L16.9536 18.0318H14.4692L9.53011 11.1154Z" fill="black"/>
        </g>
        <defs>
        <clipPath id="clip0_8552_3659">
        <rect width="20" height="20" fill="white"/>
        </clipPath>
        </defs>
        </svg>;
      default:
        return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#clip0_8552_3665)">
        <path d="M10 20C4.478 20 0 15.522 0 10C0 4.478 4.478 0 10 0C15.522 0 20 4.478 20 10C20 15.522 15.522 20 10 20Z" fill="url(#paint0_linear_8552_3665)"/>
        <path d="M9.99987 4.40395C11.8219 4.40395 12.0379 4.40995 12.7579 4.44395C13.4239 4.47395 13.7859 4.58595 14.0259 4.67995C14.3439 4.80395 14.5719 4.95195 14.8099 5.18995C15.0479 5.42795 15.1959 5.65595 15.3199 5.97395C15.4139 6.21395 15.5239 6.57595 15.5559 7.24195C15.5879 7.96195 15.5959 8.17795 15.5959 9.99995C15.5959 11.8219 15.5899 12.038 15.5559 12.7579C15.5259 13.424 15.4139 13.7859 15.3199 14.0259C15.1959 14.3439 15.0479 14.5719 14.8099 14.8099C14.5719 15.0479 14.3439 15.1959 14.0259 15.32C13.7859 15.4139 13.4239 15.5239 12.7579 15.5559C12.0379 15.5879 11.8219 15.5959 9.99987 15.5959C8.17787 15.5959 7.96187 15.5899 7.24187 15.5559C6.57588 15.5259 6.21388 15.4139 5.97388 15.32C5.65587 15.1959 5.42787 15.0479 5.18987 14.8099C4.95187 14.5719 4.80387 14.3439 4.67987 14.0259C4.58587 13.7859 4.47587 13.424 4.44387 12.7579C4.41187 12.038 4.40387 11.8219 4.40387 9.99995C4.40387 8.17795 4.40987 7.96195 4.44387 7.24195C4.47387 6.57595 4.58587 6.21395 4.67987 5.97395C4.80387 5.65595 4.95187 5.42795 5.18987 5.18995C5.42787 4.95195 5.65587 4.80395 5.97388 4.67995C6.21388 4.58595 6.57588 4.47595 7.24187 4.44395C7.96187 4.40995 8.17787 4.40395 9.99987 4.40395ZM9.99987 3.17395C8.14587 3.17395 7.91387 3.18195 7.18587 3.21595C6.45987 3.24995 5.96387 3.36395 5.52787 3.53395C5.07987 3.70595 4.69787 3.93995 4.31987 4.31995C3.93987 4.69995 3.70788 5.07995 3.53187 5.52995C3.36388 5.96395 3.24787 6.45995 3.21387 7.18795C3.17987 7.91595 3.17188 8.14795 3.17188 10.002C3.17188 11.856 3.17987 12.0879 3.21387 12.8159C3.24787 13.5419 3.36187 14.0379 3.53187 14.474C3.70587 14.9199 3.93987 15.3019 4.31987 15.6799C4.69987 16.0599 5.07987 16.292 5.52987 16.4679C5.96387 16.636 6.45987 16.7519 7.18787 16.7859C7.91587 16.8199 8.14787 16.828 10.0019 16.828C11.8559 16.828 12.0879 16.8199 12.8159 16.7859C13.5419 16.7519 14.0379 16.6379 14.4739 16.4679C14.9199 16.294 15.3019 16.0599 15.6799 15.6799C16.0599 15.2999 16.2919 14.9199 16.4679 14.4699C16.6359 14.0359 16.7519 13.5399 16.7859 12.8119C16.8199 12.0839 16.8279 11.852 16.8279 9.99795C16.8279 8.14395 16.8199 7.91195 16.7859 7.18395C16.7519 6.45795 16.6379 5.96195 16.4679 5.52595C16.2939 5.07995 16.0599 4.69795 15.6799 4.31995C15.2999 3.93995 14.9199 3.70795 14.4699 3.53195C14.0359 3.36395 13.5399 3.24795 12.8119 3.21395C12.0859 3.18195 11.8539 3.17395 9.99987 3.17395Z" fill="white"/>
        <path d="M10.0001 6.4939C8.06414 6.4939 6.49414 8.0639 6.49414 9.9999C6.49414 11.9359 8.06414 13.5059 10.0001 13.5059C11.9361 13.5059 13.5061 11.9359 13.5061 9.9999C13.5061 8.0639 11.9361 6.4939 10.0001 6.4939ZM10.0001 12.2759C8.74414 12.2759 7.72414 11.2579 7.72414 9.9999C7.72414 8.7419 8.74414 7.7239 10.0001 7.7239C11.2561 7.7239 12.2761 8.7419 12.2761 9.9999C12.2761 11.2579 11.2561 12.2759 10.0001 12.2759Z" fill="white"/>
        <path d="M13.6442 7.17601C14.0971 7.17601 14.4642 6.80888 14.4642 6.35601C14.4642 5.90314 14.0971 5.53601 13.6442 5.53601C13.1913 5.53601 12.8242 5.90314 12.8242 6.35601C12.8242 6.80888 13.1913 7.17601 13.6442 7.17601Z" fill="white"/>
        </g>
        <defs>
        <linearGradient id="paint0_linear_8552_3665" x1="2.92893" y1="17.0711" x2="17.0711" y2="2.92893" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFD521"/>
        <stop offset="0.0551048" stopColor="#FFD020"/>
        <stop offset="0.1241" stopColor="#FEC01E"/>
        <stop offset="0.2004" stopColor="#FCA71B"/>
        <stop offset="0.2821" stopColor="#FA8316"/>
        <stop offset="0.3681" stopColor="#F85510"/>
        <stop offset="0.4563" stopColor="#F51E09"/>
        <stop offset="0.5" stopColor="#F30005"/>
        <stop offset="0.5035" stopColor="#F20007"/>
        <stop offset="0.5966" stopColor="#E1003B"/>
        <stop offset="0.6879" stopColor="#D30067"/>
        <stop offset="0.7757" stopColor="#C70088"/>
        <stop offset="0.8589" stopColor="#BF00A0"/>
        <stop offset="0.9357" stopColor="#BB00AF"/>
        <stop offset="1" stopColor="#B900B4"/>
        </linearGradient>
        <clipPath id="clip0_8552_3665">
        <rect width="20" height="20" fill="white"/>
        </clipPath>
        </defs>
        </svg>;
    }
  };

  // Close dropdown when clicking outside
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
    <motion.div
      className="bg-white rounded-[10px] border border-[#F1F1F4] overflow-hidden p-4"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      style={{ boxShadow: "0px 5px 20px 0px #0000000D" }}
    >
      {/* Thumbnail */}
      <div className="w-full aspect-video relative mb-4">
        <Image 
          src={post.image} 
          alt={post.name} 
          fill 
          className="object-cover rounded-[8px]"
        />
      </div>

      {/* Content */}
      <div className="">
        {/* Video Name and Date */}
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-medium text-[#282828]">{post.name}</h3>
          <div className="flex items-center font-medium gap-1 text-sm text-[#171717]">
            <FaClock className="text-xs" />
            <span>{post.date}</span>
          </div>
        </div>

        {/* Post Performance Section */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-base font-semibold text-[#282828]">Post Performance</h4>
            <div className="relative" ref={dropdownRef}>
              <div 
                className="flex items-center gap-3 px-3 py-2 bg-[#EEEEEE] rounded-[7px] cursor-pointer hover:bg-gray-200 transition-colors"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                {getPlatformIcon(selectedPlatform)}
                <span className="text-base font-medium text-[#282828]">{selectedPlatform}</span>
                <FaChevronDown className={`text-xs text-[#858999] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
              
              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 bg-white border border-[#F1F1F4] rounded-lg shadow-lg z-10 min-w-[160px]">
                  {platformOptions.map((platform) => (
                    <div
                      key={platform}
                      className={`flex items-center gap-3 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 transition-colors ${
                        platform === selectedPlatform ? 'text-[#5046E5] bg-[#5046E510]' : 'text-[#282828]'
                      }`}
                      onClick={() => {
                        onPlatformSelect(platform);
                        setIsDropdownOpen(false);
                      }}
                    >
                      {getPlatformIcon(platform)}
                      <span className="font-medium">{platform}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mini Chart */}
          <MiniPerformanceChart 
            data={currentPlatformData.performanceData}
            selectedDay={selectedDay}
            onDaySelect={onDaySelect}
          />
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center">
            <div className="text-[10px] text-[#858999] font-medium mb-[2px]">Reach</div>
            <div className="text-base font-medium text-[#282828] mb-[2px]">{currentPlatformData.metrics.reach.value.toLocaleString()}</div>
            <div className={`inline-flex items-center border gap-1 px-[6px] py-[2px] rounded-[6.5px] text-xs font-semibold ${
              currentPlatformData.metrics.reach.change >= 0 
                ? 'bg-[#0CCC1E1A] text-[#0CCC1E] border-[#0CCC1E80]' 
                : 'bg-[#CC3C0C1A] text-[#CC3C0C] border-[#CC3C0C80]'
            }`}>
              <span>{currentPlatformData.metrics.reach.change >= 0 ? '↑' : '↓'}</span>
              <span>{Math.abs(currentPlatformData.metrics.reach.change)}%</span>
            </div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-[#858999] font-medium mb-[2px]">Impression</div>
            <div className="text-base font-medium text-[#282828] mb-[2px]">{currentPlatformData.metrics.impression.value.toLocaleString()}</div>
            <div className={`inline-flex items-center gap-1 px-[6px] py-[2px] rounded-[6.5px] border text-xs font-semibold ${
              currentPlatformData.metrics.impression.change >= 0 
                ? 'bg-[#0CCC1E1A] text-[#0CCC1E] border-[#0CCC1E80]' 
                : 'bg-[#CC3C0C1A] text-[#CC3C0C] border-[#CC3C0C80]'
            }`}>
              <span>{currentPlatformData.metrics.impression.change >= 0 ? '↑' : '↓'}</span>
              <span>{Math.abs(currentPlatformData.metrics.impression.change)}%</span>
            </div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-[#858999] font-medium mb-[2px]">Engagement</div>
            <div className="text-base font-medium text-[#282828] mb-[2px]">{currentPlatformData.metrics.engagement.value.toLocaleString()}</div>
            <div className={`inline-flex items-center gap-1 px-[6px] py-[2px] rounded-[6.5px] border text-xs font-semibold ${
              currentPlatformData.metrics.engagement.change >= 0 
                ? 'bg-[#0CCC1E1A] text-[#0CCC1E] border-[#0CCC1E80]' 
                : 'bg-[#CC3C0C1A] text-[#CC3C0C] border-[#CC3C0C80]'
            }`}>
              <span>{currentPlatformData.metrics.engagement.change >= 0 ? '↑' : '↓'}</span>
              <span>{Math.abs(currentPlatformData.metrics.engagement.change)}%</span>
            </div>
          </div>
        </div>

        {/* Separator Line */}
        <div className="w-full h-[2px] bg-[#E5E7EB] mb-4"></div>

        {/* Engagement Details */}
        <div className="flex justify-between w-full px-2">
          <div className="flex flex-col items-center gap-0">
            <span className="text-[10px] text-[#858999] font-medium">Likes</span>
            <div className="flex items-center gap-1">
              <FaRegThumbsUp className="text-sm text-[#282828]" />
              <span className="font-medium text-base text-[#282828]">{currentPlatformData.engagement.likes.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-0">
            <span className="text-[10px] text-[#858999] font-medium">Comments</span>
            <div className="flex items-center gap-1">
              <FaRegCommentDots className="text-sm text-[#282828]" />
              <span className="font-medium text-base text-[#282828]">{currentPlatformData.engagement.comments.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-0">
            <span className="text-[10px] text-[#858999] font-medium">Shares</span>
            <div className="flex items-center gap-1">
              <FaRegShareSquare className="text-sm text-[#282828]" />
              <span className="font-medium text-base text-[#282828]">{currentPlatformData.engagement.shares.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PostCard;
