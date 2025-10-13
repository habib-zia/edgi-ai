"use client";
import React, { useState, useEffect } from "react";
import DatePicker from "./DatePicker";
import TimePicker from "./TimePicker";
import CaptionsTextarea from "./CaptionsTextarea";
import CaptionsDropdown from "./CaptionsDropdown";

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
  const [formData, setFormData] = useState({
    date: postData?.date || "",
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

  // Update formData when postData changes
  useEffect(() => {
    if (postData) {
      setFormData({
        date: postData.date || "",
        time: postData.time || "",
        videoTopic: postData.videoTopic || "",
        captions: postData.captions || "",
        platform: postData.platform || "Youtube",
        // Platform-specific captions
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
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCaptionChange = (value: string) => {
    const platform = formData.platform.toLowerCase();
    setFormData(prev => ({
      ...prev,
      [platform]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prepare the data in the format expected by handleEdit
    const updateData = {
      description: formData.videoTopic,
      keypoints: formData.keypoints || '',
      captions: {
        instagram: formData.instagram || '',
        facebook: formData.facebook || '',
        linkedin: formData.linkedin || '',
        twitter: formData.twitter || '',
        tiktok: formData.tiktok || '',
        youtube: formData.youtube || ''
      },
      scheduledFor: `${formData.date.split('T')[0]} ${formData.time}:00` // Combine date and time
    };
    if (onEdit) {
      try {
        await onEdit(updateData);
        onClose();
      } catch (error) {
        console.error('Error updating post:', error);
      }
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[12px] max-w-[766px] w-full max-h-[90vh] flex flex-col relative">
        {/* Modal Header */}
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

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
              {/* Date Field */}
              <div>
                <label className="block text-base font-normal text-[#5F5F5F] mb-[2px]">Date</label>
                <DatePicker
                  value={formData.date}
                  onChange={(value) => handleInputChange('date', value)}
                  placeholder="Select Date"
                />
              </div>
              <div>
                <label className="block text-base font-normal text-[#5F5F5F] mb-[2px]">Time</label>
                <TimePicker
                  value={formData.time}
                  onChange={(value) => handleInputChange('time', value)}
                  placeholder="Select Time"
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
                  className="w-full bg-[#EEEEEE] rounded-[7px] px-3 py-2 text-sm font-medium text-[#282828] placeholder-[#858999] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#5046E5] focus:border-transparent transition-all"
                />
              </div>

            {/* Captions Field */}
            <div>
              <div className="flex items-center justify-between mb-[2px]">
                <label className="block text-base font-normal text-[#5F5F5F]">Captions</label>
                <CaptionsDropdown
                  value={formData.platform}
                  onChange={(value) => handleInputChange('platform', value)}
                />
              </div>
              <CaptionsTextarea
                value={getCurrentCaption()}
                onChange={handleCaptionChange}
                placeholder="Enter Caption"
              />
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="px-6 pb-6 flex-shrink-0">
          <button
            onClick={handleSubmit}
            className="w-full bg-[#5046E5] text-white py-3 px-6 font-semibold rounded-full text-xl hover:bg-transparent hover:text-[#5046E5] border-2 border-[#5046E5] transition-colors duration-300"
          >
            Updated
          </button>
        </div>
      </div>
    </div>
  );
}
