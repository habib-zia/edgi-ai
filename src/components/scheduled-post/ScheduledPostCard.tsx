"use client";
import React, { useState, useRef, useEffect } from "react";
import { FaClock, FaChevronDown } from "react-icons/fa6";
import EditPostModal from "./EditPostModal";
import { apiService } from "@/lib/api-service";
import { getPlatformIcon } from "@/utils/platformIcons";

interface ScheduledPost {
  id: string;
  index: number;
  scheduleId: string;
  description: string;
  keypoints: string;
  scheduledFor: string;
  status: string;
  captions: {
    instagram: string;
    facebook: string;
    linkedin: string;
    twitter: string;
    tiktok: string;
    youtube: string;
  };
  scheduledForLocal: string;
}

interface ScheduledPostCardProps {
  post: ScheduledPost;
  scheduleId?: string;
  onPostDeleted?: () => void;
  onPostUpdated?: () => void;
}

export default function ScheduledPostCard({ post, scheduleId, onPostDeleted, onPostUpdated }: ScheduledPostCardProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState("Instagram");
  const [platformCaptions, setPlatformCaptions] = useState<{[key: string]: string}>({});
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const platformOptions = ['Instagram', 'Facebook', 'LinkedIn', 'Twitter', 'TikTok', 'Youtube'];

  const formatDate = (dateString: string) => {
    if (!dateString) return dateString;
    
    try {
      let date: Date;
      
      if (dateString.includes('T')) {
        date = new Date(dateString);
      } else if (dateString.includes(' ')) {
        date = new Date(dateString.replace(' ', 'T'));
      } else if (dateString.includes(':')) {
        const today = new Date();
        const [hours, minutes] = dateString.split(':');
        date = new Date(today.getFullYear(), today.getMonth(), today.getDate(), parseInt(hours), parseInt(minutes));
      } else {
        date = new Date(dateString);
      }
      
      if (isNaN(date.getTime())) {
        return dateString;
      }
      
      return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return dateString;
    }
  };



  const handleEdit = async (updateData?: any) => {
    try {
      if (!scheduleId) {
        if ((window as any).showNotification) {
          (window as any).showNotification({
            type: 'error',
            title: 'Update Failed',
            message: 'No schedule ID found',
            duration: 5000
          });
        }
        return;
      }

      const dataToUpdate = updateData || {
        description: post.description,
        keypoints: post.keypoints || '',
        captions: {
          instagram: platformCaptions['Instagram'] || post.captions?.instagram || '',
          facebook: platformCaptions['Facebook'] || post.captions?.facebook || '',
          linkedin: platformCaptions['LinkedIn'] || post.captions?.linkedin || '',
          twitter: platformCaptions['Twitter'] || post.captions?.twitter || '',
          tiktok: platformCaptions['TikTok'] || post.captions?.tiktok || '',
          youtube: platformCaptions['Youtube'] || post.captions?.youtube || ''
        },
        scheduledFor: post.scheduledFor
      };
      
      const response = await apiService.updatePost(scheduleId, post.id.toString(), dataToUpdate);
      
      if (response.success) {
        if ((window as any).showNotification) {
          (window as any).showNotification({
            type: 'success',
            title: 'Post Updated',
            message: 'Post has been updated successfully!',
            duration: 5000
          });
        }
        
        if (onPostUpdated) {
          onPostUpdated();
        }
      } else {
        if ((window as any).showNotification) {
          (window as any).showNotification({
            type: 'error',
            title: 'Update Failed',
            message: response.message || 'Failed to update post',
            duration: 5000
          });
        }
      }
    } catch (error) {
      if ((window as any).showNotification) {
        (window as any).showNotification({
          type: 'error',
          title: 'Network Error',
          message: 'Failed to update post. Please try again.',
          duration: 5000
        });
      }
    }
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleDelete = async () => {
    try {
      if (!scheduleId) {
        if ((window as any).showNotification) {
          (window as any).showNotification({
            type: 'error',
            title: 'Delete Failed',
            message: 'No schedule ID found',
            duration: 5000
          });
        }
        return;
      }
      const response = await apiService.deletePost(post.scheduleId, post.id.toString());
      
      if (response.success) {
        if ((window as any).showNotification) {
          (window as any).showNotification({
            type: 'success',
            title: 'Post Deleted',
            message: 'Post has been deleted successfully!',
            duration: 5000
          });
        }
        
        if (onPostDeleted) {
          onPostDeleted();
        }
      } else {
        if ((window as any).showNotification) {
          (window as any).showNotification({
            type: 'error',
            title: 'Delete Failed',
            message: response.message || 'Failed to delete post',
            duration: 5000
          });
        }
      }
    } catch (error) {
      if ((window as any).showNotification) {
        (window as any).showNotification({
          type: 'error',
          title: 'Network Error',
          message: 'Failed to delete post. Please try again.',
          duration: 5000
        });
      }
    }
  };


  const handlePlatformSelect = (platform: string) => {
    setSelectedPlatform(platform);
    setIsDropdownOpen(false);
  };

  const getCurrentCaption = () => {
    if (platformCaptions[selectedPlatform]) {
      return platformCaptions[selectedPlatform];
    }
    
    if (post.captions) {
      const platformKey = selectedPlatform.toLowerCase() as keyof typeof post.captions;
      const platformCaption = post.captions[platformKey];
      if (platformCaption) {
        return platformCaption;
      }
    }
    
    return post.captions?.instagram || "";
  };

  useEffect(() => {
    if (post.captions) {
      const initialCaptions: {[key: string]: string} = {};
      platformOptions.forEach(platform => {
        const platformKey = platform.toLowerCase() as keyof typeof post.captions;
        const platformCaption = post.captions![platformKey];
        if (platformCaption) {
          initialCaptions[platform] = platformCaption;
        }
      });
      setPlatformCaptions(initialCaptions);
    }
  }, [post]);

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
    <div className="bg-[#EEEEEE] rounded-xl p-4 flex flex-col h-full">
      <div className="flex-1">
      <div className="flex justify-between items-center mb-2">
          <span className="text-[18px] text-[#171717] font-medium truncate">
            {post.description}
        </span>
        <div className="flex items-center gap-2 text-sm text-[#171717]">
          <FaClock className="text-xs" />
            <span className="text-xs">{formatDate(post.scheduledForLocal)}</span>
          </div>
      </div>

        <h3 className="text-[20px] !font-normal text-[#5F5F5F] mb-4 truncate">
          {post.keypoints}
      </h3>

      <div className="flex justify-between items-center mb-3">
        <span className="text-base text-[#282828] font-medium">
          Captions
        </span>
        <div className="relative" ref={dropdownRef}>
          <div 
            className="flex items-center gap-3 px-3 bg-[#EEEEEE] rounded-[7px] cursor-pointer transition-colors"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            {getPlatformIcon(selectedPlatform)}
            <span className="text-base font-medium text-[#282828]">{selectedPlatform}</span>
            <FaChevronDown className={`text-xs text-[#858999] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </div>
          
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 bg-white border border-[#F1F1F4] rounded-lg shadow-lg z-10 min-w-[160px]">
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

      <div className="mb-1">
        <p className="w-full bg-[#FFFFFF] rounded-lg px-3 py-2 text-sm text-[#171717] min-h-[60px] flex items-start break-all overflow-wrap-anywhere whitespace-normal leading-relaxed">
          {getCurrentCaption() || "This is the caption that will be posted on the"}
        </p>
        </div>
      </div>

      <div className="flex justify-end items-center gap-3 mt-auto">
        <button 
          onClick={handleDelete}
          className="text-[#5F5F5F] hover:text-red-500 transition-colors p-2 bg-[#F9DFDF] rounded-full px-3 py-[6px] hover:bg-[#F9DFDF]/50"
        >
          <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.54799 4.28573H12.1194C12.1194 3.81213 11.9313 3.35793 11.5964 3.02304C11.2615 2.68815 10.8073 2.50002 10.3337 2.50002C9.8601 2.50002 9.4059 2.68815 9.07101 3.02304C8.73613 3.35793 8.54799 3.81213 8.54799 4.28573ZM7.47656 4.28573C7.47656 3.52797 7.77758 2.80124 8.3134 2.26543C8.84922 1.72961 9.57594 1.42859 10.3337 1.42859C11.0915 1.42859 11.8182 1.72961 12.354 2.26543C12.8898 2.80124 13.1908 3.52797 13.1908 4.28573H17.6551C17.7972 4.28573 17.9335 4.34217 18.0339 4.44264C18.1344 4.5431 18.1908 4.67937 18.1908 4.82145C18.1908 4.96353 18.1344 5.09979 18.0339 5.20025C17.9335 5.30072 17.7972 5.35716 17.6551 5.35716H16.7194L15.8501 15.7879C15.7869 16.5467 15.4408 17.254 14.8805 17.7696C14.3202 18.2852 13.5866 18.5714 12.8251 18.5714H7.84228C7.08084 18.5714 6.34723 18.2852 5.78692 17.7696C5.22661 17.254 4.88052 16.5467 4.81728 15.7879L3.94799 5.35716H3.01228C2.8702 5.35716 2.73394 5.30072 2.63347 5.20025C2.533 5.09979 2.47656 4.96353 2.47656 4.82145C2.47656 4.67937 2.533 4.5431 2.63347 4.44264C2.73394 4.34217 2.8702 4.28573 3.01228 4.28573H7.47656ZM5.88513 15.6986C5.92598 16.1896 6.14986 16.6473 6.51238 16.981C6.8749 17.3147 7.34957 17.4999 7.84228 17.5H12.8251C13.3178 17.4999 13.7925 17.3147 14.155 16.981C14.5175 16.6473 14.7414 16.1896 14.7823 15.6986L15.6451 5.35716H5.02299L5.88513 15.6986ZM8.72656 7.85716C8.86864 7.85716 9.0049 7.9136 9.10537 8.01407C9.20583 8.11453 9.26228 8.25079 9.26228 8.39287V14.4643C9.26228 14.6064 9.20583 14.7426 9.10537 14.8431C9.0049 14.9436 8.86864 15 8.72656 15C8.58448 15 8.44822 14.9436 8.34776 14.8431C8.24729 14.7426 8.19085 14.6064 8.19085 14.4643V8.39287C8.19085 8.25079 8.24729 8.11453 8.34776 8.01407C8.44822 7.9136 8.58448 7.85716 8.72656 7.85716ZM12.4766 8.39287C12.4766 8.25079 12.4201 8.11453 12.3197 8.01407C12.2192 7.9136 12.0829 7.85716 11.9408 7.85716C11.7988 7.85716 11.6625 7.9136 11.562 8.01407C11.4616 8.11453 11.4051 8.25079 11.4051 8.39287V14.4643C11.4051 14.6064 11.4616 14.7426 11.562 14.8431C11.6625 14.9436 11.7988 15 11.9408 15C12.0829 15 12.2192 14.9436 12.3197 14.8431C12.4201 14.7426 12.4766 14.6064 12.4766 14.4643V8.39287Z" fill="#E54B46"/>
          </svg>

        </button>
        <button 
          onClick={() => setIsEditModalOpen(true)}
          className="bg-[#5046E5] text-white px-[23px] py-[7px] rounded-full text-xs font-semibold hover:bg-transparent hover:text-[#5046E5] transition-all border-2 border-[#5046E5]"
        >
          Edit
        </button>
      </div>
    </div>
    <EditPostModal
      isOpen={isEditModalOpen}
      onClose={handleCloseEditModal}
      onEdit={handleEdit}
      postData={{
        ...post,
        date: post.scheduledForLocal,
        time: post.scheduledForLocal.includes('T') ? post.scheduledForLocal.split('T')[1]?.substring(0, 5) || "10:00" : 
              post.scheduledForLocal.includes(' ') ? post.scheduledForLocal.split(' ')[1]?.substring(0, 5) || "10:00" : "10:00",
        videoTopic: post.description,
        captions: post.captions,
        platform: selectedPlatform
      }}
    />
    </>
  );
}
