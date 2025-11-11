"use client";
import React, { useState, useEffect, useRef } from "react";
import DatePicker from "./DatePicker";
import TimePicker from "./TimePicker";
import CaptionsTextarea from "./CaptionsTextarea";
import CaptionsDropdown from "./CaptionsDropdown";
import { apiService } from "@/lib/api-service";
import { 
  getCurrentDate, 
  getMinTimeForToday, 
  isPostScheduledSoon, 
  getCleanDate 
} from '@/utils/dateTimeUtils';
import { useModalScrollLock } from "@/hooks/useModalScrollLock";


interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (formData: any) => Promise<void>;
  postData?: {
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
    platform: string;
    date: string;
    time: string;
    videoTopic: string;
  };
}

export default function EditPostModal({ isOpen, onClose, onEdit, postData }: EditPostModalProps) {
  const originalVideoTopicRef = useRef<string>("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [formData, setFormData] = useState({
    date: getCleanDate(postData?.date),
    time: postData?.time || "",
    videoTopic: postData?.videoTopic || "",
    captions: postData?.captions || "",
    platform: postData?.platform || "Youtube",
    // Platform-specific captions
    instagram: typeof postData?.captions === 'object' && postData?.captions !== null ? postData.captions.instagram || "" : "",
    facebook: typeof postData?.captions === 'object' && postData?.captions !== null ? postData.captions.facebook || "" : "",
    linkedin: typeof postData?.captions === 'object' && postData?.captions !== null ? postData.captions.linkedin || "" : "",
    twitter: typeof postData?.captions === 'object' && postData?.captions !== null ? postData.captions.twitter || "" : "",
    tiktok: typeof postData?.captions === 'object' && postData?.captions !== null ? postData.captions.tiktok || "" : "",
    youtube: typeof postData?.captions === 'object' && postData?.captions !== null ? postData.captions.youtube || "" : "",
    // Additional post data
    id: postData?.id || "",
    index: postData?.index || 0,
    keypoints: postData?.keypoints || ""
  });

  const [timeAdjustmentMessage, setTimeAdjustmentMessage] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useModalScrollLock(isOpen)


  // Get current date and time for restrictions
  const minDate = getCurrentDate();
  const minTimeForToday = getMinTimeForToday(40);

  // Check if post is scheduled soon (today and within 40 minutes)
  const isRestricted = isPostScheduledSoon(formData.date, formData.time, 40);

  useEffect(() => {
    if (postData) {
      const initialVideoTopic = postData.videoTopic || "";
      originalVideoTopicRef.current = initialVideoTopic;
      
      setFormData({
        date: getCleanDate(postData.date),
        time: postData.time || "",
        videoTopic: initialVideoTopic,
        captions: postData.captions || "",
        platform: postData.platform || "Youtube",
        instagram: typeof postData.captions === 'object' ? postData.captions?.instagram || "" : "",
        facebook: typeof postData.captions === 'object' ? postData.captions?.facebook || "" : "",
        linkedin: typeof postData.captions === 'object' ? postData.captions?.linkedin || "" : "",
        twitter: typeof postData.captions === 'object' ? postData.captions?.twitter || "" : "",
        tiktok: typeof postData.captions === 'object' ? postData.captions?.tiktok || "" : "",
        youtube: typeof postData.captions === 'object' ? postData.captions?.youtube || "" : "",
        // Additional post data
        id: postData.id || "",
        index: postData.index || 0,
        keypoints: postData.keypoints || ""
      });
    }
  }, [postData]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Get current caption based on selected platform
  const getCurrentCaption = () => {
    const platform = formData.platform.toLowerCase();
    switch (platform) {
      case 'instagram':
        return formData.instagram;
      case 'facebook':
        return formData.facebook;
      case 'linkedin':
        return formData.linkedin;
      case 'twitter':
      case 'x':
        return formData.twitter;
      case 'tiktok':
        return formData.tiktok;
      case 'youtube':
        return formData.youtube;
      default:
        return typeof formData.captions === 'string' ? formData.captions : '';
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === 'date') {
      const selectedDate = new Date(value);
      const today = new Date();
      const isToday = selectedDate.toDateString() === today.toDateString();
      
      if (isToday && formData.time) {
        const now = new Date();
        const minTime = new Date(now.getTime() + 40 * 60 * 1000);
        const minTimeStr = minTime.toTimeString().slice(0, 5);
        const selectedTime = new Date(`${value}T${formData.time}:00`);
        const minTimeForToday = new Date(`${value}T${minTimeStr}:00`);
        
        if (selectedTime < minTimeForToday) {
          const adjustedTime = minTimeStr;
          setTimeAdjustmentMessage(`You cannot proceed with today's date with past time. Time automatically adjusted to ${adjustedTime} (40 minutes from now)`);
          
          // Clear previous timeout
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          
          // Set new timeout with cleanup
          timeoutRef.current = setTimeout(() => {
            setTimeAdjustmentMessage(null);
            timeoutRef.current = null;
          }, 10000);
          
          setFormData(prev => ({
            ...prev,
            [field]: value,
            time: adjustedTime
          }));
          return;
        }
      }
    }
    
    if (field === 'time') {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      const isToday = selectedDate.toDateString() === today.toDateString();
      
      if (isToday) {
        const now = new Date();
        const minTime = new Date(now.getTime() + 40 * 60 * 1000);
        const minTimeStr = minTime.toTimeString().slice(0, 5);
        const selectedTime = new Date(`${formData.date}T${value}:00`);
        const minTimeForToday = new Date(`${formData.date}T${minTimeStr}:00`);
        
        if (selectedTime < minTimeForToday) {
          const adjustedTime = minTimeStr;
          setTimeAdjustmentMessage(`You cannot proceed with today's date with past time. Time automatically adjusted to ${adjustedTime} (40 minutes from now)`);
          
          // Clear previous timeout
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          
          // Set new timeout with cleanup
          timeoutRef.current = setTimeout(() => {
            setTimeAdjustmentMessage(null);
            timeoutRef.current = null;
          }, 10000);
          
          setFormData(prev => ({
            ...prev,
            time: adjustedTime
          }));
          return;
        }
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCaptionChange = (value: string) => {
    const platform = formData.platform.toLowerCase();
    const captionKey = platform === 'x' ? 'twitter' : platform;
    setFormData(prev => ({
      ...prev,
      [captionKey]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      let updatedKeypoints = formData.keypoints || '';
      
      // Check if videoTopic has changed
      const videoTopicChanged = formData.videoTopic.trim() !== originalVideoTopicRef.current.trim();
      
      if (videoTopicChanged && formData.videoTopic.trim()) {
        // Call the trends API to get updated keypoints
        try {
          const trendsResponse = await apiService.getDescriptionKeypoints(formData.videoTopic.trim());
          
          if (trendsResponse.success && trendsResponse.data?.keypoints) {
            updatedKeypoints = trendsResponse.data.keypoints;
          } else {
            console.warn('Failed to get keypoints from trends API, using existing keypoints');
          }
        } catch (error) {
          console.error('Error fetching keypoints from trends API:', error);
          // Continue with existing keypoints if API call fails
        }
      }
      
      const updateData = {
        description: formData.videoTopic,
        keypoints: updatedKeypoints,
        captions: {
          instagram: formData.instagram || '',
          facebook: formData.facebook || '',
          linkedin: formData.linkedin || '',
          twitter: formData.twitter || '',
          tiktok: formData.tiktok || '',
          youtube: formData.youtube || ''
        },
        scheduledFor: `${getCleanDate(formData.date)} ${formData.time}:00`
      };
      
      if (onEdit) {
        await onEdit(updateData);
        onClose();
      } else {
        onClose();
      }
    } catch (error) {
      console.error('Error updating post:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[12px] max-w-[766px] w-full max-h-[90vh] flex flex-col relative">
        <div className="flex items-center justify-between px-6 pt-6 pb-7 flex-shrink-0">
          <h2 className="md:text-[32px] text-[24px] font-semibold text-[#282828]">Updated Post</h2>
          <button
            onClick={onClose}
            className="cursor-pointer"
            aria-label="Close modal"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_8737_6740)"><path d="M22.5 1.5L1.5 22.5M1.5 1.5L22.5 22.5" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </g><defs><clipPath id="clip0_8737_6740"><rect width="24" height="24" fill="white"/>
              </clipPath></defs>
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 pb-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Warning Message for Restricted Posts */}
            {isRestricted && (
              <div className="w-full p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-yellow-500 rounded-full flex-shrink-0 mt-0.5"></div>
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800 mb-1">Editing Restricted</h4>
                    <p className="text-sm text-yellow-700">This post is scheduled within 40 minutes. You cannot edit the date and time.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Time Adjustment Message */}
            {timeAdjustmentMessage && (
              <div className="w-full p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-red-500 rounded-full flex-shrink-0 mt-0.5"></div>
                  <div>
                    <h4 className="text-sm font-medium text-red-800 mb-1">Time Restriction</h4>
                    <p className="text-sm text-red-700">{timeAdjustmentMessage}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
              <div>
                <label className="block text-base font-normal text-[#5F5F5F] mb-[2px]">Date</label>
                <DatePicker
                  value={formData.date}
                  onChange={(value) => handleInputChange('date', value)}
                  placeholder="Select Date"
                  disabled={isRestricted}
                  minDate={minDate}
                />
              </div>
              <div>
                <label className="block text-base font-normal text-[#5F5F5F] mb-[2px]">Time</label>
                <TimePicker
                  value={formData.time}
                  onChange={(value) => handleInputChange('time', value)}
                  placeholder="Select Time"
                  disabled={isRestricted}
                  minTime={formData.date === minDate ? minTimeForToday : undefined}
                />
              </div>
            </div>
              <div>
                <label className="block text-base font-normal text-[#5F5F5F] mb-[2px]">
                  Video Topic <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.videoTopic}
                  onChange={(e) => handleInputChange('videoTopic', e.target.value)}
                  placeholder="Please Specify"
                  disabled={isRestricted}
                  className="w-full bg-[#EEEEEE] rounded-[7px] px-3 py-2 text-sm font-medium text-[#282828] placeholder-[#858999] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#5046E5] focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

            <div>
              <div className="flex items-center justify-between mb-[2px]">
                <label className="block text-base font-normal text-[#5F5F5F]">Captions</label>
                <CaptionsDropdown
                  value={formData.platform}
                  onChange={(value) => handleInputChange('platform', value)}
                  disabled={isRestricted}
                />
              </div>
              <CaptionsTextarea
                value={getCurrentCaption()}
                onChange={handleCaptionChange}
                placeholder="Enter Caption"
                disabled={isRestricted}
              />
            </div>
          </form>
        </div>
        <div className="px-6 pb-6 flex-shrink-0">
          <button
            onClick={handleSubmit}
            disabled={isRestricted || isUpdating}
            className={`w-full py-3 px-6 font-semibold rounded-full text-xl transition-colors duration-300 ${
              isRestricted || isUpdating
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                : 'bg-[#5046E5] text-white hover:bg-transparent hover:text-[#5046E5] border-2 border-[#5046E5]'
            }`}
          >
            {isUpdating ? 'Updating post...' : isRestricted ? 'Editing Restricted' : 'Update'}
          </button>
        </div>
      </div>
    </div>
  );
}
