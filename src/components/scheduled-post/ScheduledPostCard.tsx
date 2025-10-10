"use client";
import React, { useState, useRef, useEffect } from "react";
import { FaClock, FaChevronDown } from "react-icons/fa6";
import EditPostModal from "./EditPostModal";

interface ScheduledPost {
  id: number;
  topic: string;
  title: string;
  caption: string;
  platform: string;
  date: string;
}

interface ScheduledPostCardProps {
  post: ScheduledPost;
}

export default function ScheduledPostCard({ post }: ScheduledPostCardProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState("Youtube");
  const [caption, setCaption] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const platformOptions = ['Instagram', 'Facebook', 'Twitter'];

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

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleDelete = () => {
    // Handle delete functionality
    console.log("Delete post:", post.id);
  };

  const handlePlatformSelect = (platform: string) => {
    setSelectedPlatform(platform);
    setIsDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
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
    <>
    <div className="bg-[#EEEEEE] rounded-xl p-4">
      {/* Top Row - Topic and Date */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-lg text-[#171717] font-medium">
          {post.topic}
        </span>
        <div className="flex items-center gap-2 text-sm text-[#171717]">
          <FaClock className="text-xs" />
          <span>{post.date}</span>
        </div>
      </div>

      {/* Topic Title */}
      <h3 className="text-xl !font-normal text-[#5F5F5F] mb-4">
        {post.title}
      </h3>

      {/* Captions and Platform */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-base text-[#282828] font-medium">
          Captions
        </span>
        <div className="relative" ref={dropdownRef}>
          <div 
            className="flex items-center gap-3 px-3 bg-[#EEEEEE] rounded-[7px] cursor-pointer transition-colors"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            {selectedPlatform === "Youtube" ? (
              <div className="w-5 h-5 bg-red-600 rounded flex items-center justify-center">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="12" height="8" rx="1" fill="white"/>
                  <path d="M4.5 2.5L7.5 4L4.5 5.5V2.5Z" fill="#FF0000"/>
                </svg>
              </div>
            ) : (
              getPlatformIcon(selectedPlatform)
            )}
            <span className="text-base font-medium text-[#282828]">{selectedPlatform}</span>
            <FaChevronDown className={`text-xs text-[#858999] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </div>
          
          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 bg-white border border-[#F1F1F4] rounded-lg shadow-lg z-10 min-w-[160px]">
              <div
                className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 transition-colors text-[#282828]"
                onClick={() => {
                  handlePlatformSelect("Youtube");
                  setIsDropdownOpen(false);
                }}
              >
                <div className="w-5 h-5 bg-red-600 rounded flex items-center justify-center">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="12" height="8" rx="1" fill="white"/>
                    <path d="M4.5 2.5L7.5 4L4.5 5.5V2.5Z" fill="#FF0000"/>
                  </svg>
                </div>
                <span className="font-medium">Youtube</span>
              </div>
              {platformOptions.map((platform) => (
                <div
                  key={platform}
                  className={`flex items-center gap-3 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 transition-colors ${
                    platform === selectedPlatform ? 'text-[#5046E5] bg-[#5046E510]' : 'text-[#282828]'
                  }`}
                  onClick={() => {
                    handlePlatformSelect(platform);
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

      {/* Caption Text Area */}
      <div className="mb-1">
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="This is the caption that will be posted on the"
          className="w-full bg-[#FFFFFF] rounded-lg px-3 py-2 text-sm text-[#171717] placeholder-[#11101066] resize-none focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:border-transparent transition-all"
          rows={3}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end items-center gap-3">
        <button 
          onClick={handleDelete}
          className="text-[#5F5F5F] hover:text-red-500 transition-colors p-2 bg-[#F9DFDF] rounded-full px-3 py-[6px] hover:bg-[#F9DFDF]/50"
        >
          <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.54799 4.28573H12.1194C12.1194 3.81213 11.9313 3.35793 11.5964 3.02304C11.2615 2.68815 10.8073 2.50002 10.3337 2.50002C9.8601 2.50002 9.4059 2.68815 9.07101 3.02304C8.73613 3.35793 8.54799 3.81213 8.54799 4.28573ZM7.47656 4.28573C7.47656 3.52797 7.77758 2.80124 8.3134 2.26543C8.84922 1.72961 9.57594 1.42859 10.3337 1.42859C11.0915 1.42859 11.8182 1.72961 12.354 2.26543C12.8898 2.80124 13.1908 3.52797 13.1908 4.28573H17.6551C17.7972 4.28573 17.9335 4.34217 18.0339 4.44264C18.1344 4.5431 18.1908 4.67937 18.1908 4.82145C18.1908 4.96353 18.1344 5.09979 18.0339 5.20025C17.9335 5.30072 17.7972 5.35716 17.6551 5.35716H16.7194L15.8501 15.7879C15.7869 16.5467 15.4408 17.254 14.8805 17.7696C14.3202 18.2852 13.5866 18.5714 12.8251 18.5714H7.84228C7.08084 18.5714 6.34723 18.2852 5.78692 17.7696C5.22661 17.254 4.88052 16.5467 4.81728 15.7879L3.94799 5.35716H3.01228C2.8702 5.35716 2.73394 5.30072 2.63347 5.20025C2.533 5.09979 2.47656 4.96353 2.47656 4.82145C2.47656 4.67937 2.533 4.5431 2.63347 4.44264C2.73394 4.34217 2.8702 4.28573 3.01228 4.28573H7.47656ZM5.88513 15.6986C5.92598 16.1896 6.14986 16.6473 6.51238 16.981C6.8749 17.3147 7.34957 17.4999 7.84228 17.5H12.8251C13.3178 17.4999 13.7925 17.3147 14.155 16.981C14.5175 16.6473 14.7414 16.1896 14.7823 15.6986L15.6451 5.35716H5.02299L5.88513 15.6986ZM8.72656 7.85716C8.86864 7.85716 9.0049 7.9136 9.10537 8.01407C9.20583 8.11453 9.26228 8.25079 9.26228 8.39287V14.4643C9.26228 14.6064 9.20583 14.7426 9.10537 14.8431C9.0049 14.9436 8.86864 15 8.72656 15C8.58448 15 8.44822 14.9436 8.34776 14.8431C8.24729 14.7426 8.19085 14.6064 8.19085 14.4643V8.39287C8.19085 8.25079 8.24729 8.11453 8.34776 8.01407C8.44822 7.9136 8.58448 7.85716 8.72656 7.85716ZM12.4766 8.39287C12.4766 8.25079 12.4201 8.11453 12.3197 8.01407C12.2192 7.9136 12.0829 7.85716 11.9408 7.85716C11.7988 7.85716 11.6625 7.9136 11.562 8.01407C11.4616 8.11453 11.4051 8.25079 11.4051 8.39287V14.4643C11.4051 14.6064 11.4616 14.7426 11.562 14.8431C11.6625 14.9436 11.7988 15 11.9408 15C12.0829 15 12.2192 14.9436 12.3197 14.8431C12.4201 14.7426 12.4766 14.6064 12.4766 14.4643V8.39287Z" fill="#E54B46"/>
          </svg>

        </button>
        <button 
          onClick={handleEdit}
          className="bg-[#5046E5] text-white px-[23px] py-[7px] rounded-full text-xs font-semibold hover:bg-transparent hover:text-[#5046E5] transition-all border-2 border-[#5046E5]"
        >
          Edit
        </button>
      </div>
    </div>

    {/* Edit Post Modal */}
    <EditPostModal
      isOpen={isEditModalOpen}
      onClose={handleCloseEditModal}
      postData={{
        date: post.date,
        time: "10:00", // Default time, you can add this to your post interface
        videoTopic: post.topic,
        captions: post.caption,
        platform: selectedPlatform
      }}
    />
    </>
  );
}
