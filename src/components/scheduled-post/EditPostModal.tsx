"use client";
import React, { useState } from "react";
import DatePicker from "./DatePicker";
import TimePicker from "./TimePicker";
import VideoTopicDropdown from "./VideoTopicDropdown";
import CaptionsTextarea from "./CaptionsTextarea";
import CaptionsDropdown from "./CaptionsDropdown";

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  postData?: {
    date: string;
    time: string;
    videoTopic: string;
    captions: string;
    platform: string;
  };
}

export default function EditPostModal({ isOpen, onClose, postData }: EditPostModalProps) {
  const [formData, setFormData] = useState({
    date: postData?.date || "",
    time: postData?.time || "",
    videoTopic: postData?.videoTopic || "",
    captions: postData?.captions || "",
    platform: postData?.platform || "Youtube"
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Updated post data:", formData);
    onClose();
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

              {/* Time Field */}
              <div>
                <label className="block text-base font-normal text-[#5F5F5F] mb-[2px]">Time</label>
                <TimePicker
                  value={formData.time}
                  onChange={(value) => handleInputChange('time', value)}
                  placeholder="Select Time"
                />
              </div>
            </div>

            {/* Video Topic Field */}
            <div>
              <label className="block text-base font-normal text-[#5F5F5F] mb-[2px]">
                Video Topic <span className="text-red-500">*</span>
              </label>
              <VideoTopicDropdown
                value={formData.videoTopic}
                onChange={(value) => handleInputChange('videoTopic', value)}
                placeholder="Please Specify"
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
                value={formData.captions}
                onChange={(value) => handleInputChange('captions', value)}
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
