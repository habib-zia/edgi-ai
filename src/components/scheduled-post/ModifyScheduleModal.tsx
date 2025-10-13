"use client";
import React, { useState, useEffect } from "react";
import DatePicker from "./DatePicker";
import FrequencyDropdown from "./FrequencyDropdown";
import TimePicker from "./TimePicker";


interface ModifyScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  scheduledPostsDurationData?: {
    frequency: string;
    schedule: {
      days: string[];
      times: string[];
    };
    startDate: string;
    stats: {
      completed: number;
      pending: number;
      processing: number;
      total: number;
    };
    updatedAt: string;
  };
}

interface ScheduleData {
  frequency: string;
  posts: Array<{
    day: string;
    time: string;
  }>;
}

export default function ModifyScheduleModal({ isOpen, onClose, scheduledPostsDurationData }: ModifyScheduleModalProps) {
  const [scheduleData, setScheduleData] = useState<ScheduleData>({
    frequency: "Twice a Week",
    posts: [
      { day: "", time: "" },
      { day: "", time: "" }
    ]
  });

  // Populate form data when modal opens with existing data
  useEffect(() => {
    if (scheduledPostsDurationData && isOpen) {
      const { frequency, schedule } = scheduledPostsDurationData;
      
      // Convert frequency from API format to display format
      const displayFrequency = frequency === "twice_week" ? "Twice a Week" : 
                              frequency === "daily" ? "Daily" : 
                              frequency === "weekly" ? "Weekly" : "Twice a Week";
      
      // Create posts array from days and times
      const posts = schedule.days.map((day, index) => ({
        day: day,
        time: schedule.times[index] || ""
      }));
      
      setScheduleData({
        frequency: displayFrequency,
        posts: posts
      });
    }
  }, [scheduledPostsDurationData, isOpen]);

  const handleFrequencyChange = (frequency: string) => {
    setScheduleData(prev => ({
      ...prev,
      frequency
    }));
  };

  const handlePostChange = (index: number, field: 'day' | 'time', value: any) => {
    setScheduleData(prev => ({
      ...prev,
      posts: prev.posts.map((post, i) => 
        i === index ? { ...post, [field]: value } : post
      )
    }));
  };

  const handleUpdate = () => {
    console.log("Updating schedule:", scheduleData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[12px] max-w-[766px] w-full max-h-[90vh] flex flex-col relative">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-7 flex-shrink-0">
          <h2 className="md:text-[32px] text-[24px] font-semibold text-[#282828]">Modify Schedule</h2>
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
          {/* Information Banner */}
          <div className="bg-[#EF99431A] rounded-lg px-4 py-[10px] mb-6">
            <div className="flex items-center gap-3">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M12.002 2.99994C7.03139 2.99994 3.00195 7.02938 3.00195 11.9999C3.00195 16.9705 7.03139 20.9999 12.002 20.9999C16.9725 20.9999 21.002 16.9705 21.002 11.9999C21.002 7.02938 16.9725 2.99994 12.002 2.99994ZM1.00195 11.9999C1.00195 5.92481 5.92682 0.999939 12.002 0.999939C18.0771 0.999939 23.002 5.92481 23.002 11.9999C23.002 18.0751 18.0771 22.9999 12.002 22.9999C5.92682 22.9999 1.00195 18.0751 1.00195 11.9999Z" fill="#EF9943"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M11.998 11.0001C12.5503 11.0001 12.998 11.4478 12.998 12.0001V16.0001C12.998 16.5523 12.5503 17.0001 11.998 17.0001C11.4458 17.0001 10.998 16.5523 10.998 16.0001V12.0001C10.998 11.4478 11.4458 11.0001 11.998 11.0001Z" fill="#EF9943"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M10.998 7.99994C10.998 7.44765 11.4458 6.99994 11.998 6.99994H12.008C12.5603 6.99994 13.008 7.44765 13.008 7.99994C13.008 8.55222 12.5603 8.99994 12.008 8.99994H11.998C11.4458 8.99994 10.998 8.55222 10.998 7.99994Z" fill="#EF9943"/>
            </svg>

              <p className="text-[#EF9943] md:text-lg text-base !font-tight leading-[140%] max-w-[90%]">
                These posts will be scheduled for whole month and this schedule will starts from {scheduledPostsDurationData?.startDate ? new Date(scheduledPostsDurationData.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '13-Oct-2025'}
              </p>
            </div>
          </div>

          {/* Frequency of Posting */}
          <div className="mb-6">
            <label className="block text-base font-normal text-[#5F5F5F] mb-[2px]">
              Frequency of Posting
            </label>
            <FrequencyDropdown
              value={scheduleData.frequency}
              onChange={handleFrequencyChange}
            />
          </div>

          

          {/* Select Date & Time Section */}
          <div>
            <h3 className="text-base font-medium text-[#282828] mb-1">
              Select Date & Time for each post
            </h3>
            {/* Separator Line */}
          <div className="w-full border-[1px] border-[#AFAFAF] mb-3"></div>
            
            <div className="space-y-4">
              {scheduleData.posts.map((post, index) => (
                <div key={index} className="grid md:grid-cols-2 grid-cols-1 gap-4">
                  {/* Day Picker */}
                  <div>
                    <label className="block text-base font-normal text-[#5F5F5F] mb-[2px]">
                      Day
                    </label>
                    <DatePicker
                      value={post.day}
                      onChange={(value) => handlePostChange(index, 'day', value)}
                      placeholder="Select Day"
                    />
                  </div>

                  {/* Time Picker */}
                  <div>
                    <label className="block text-base font-normal text-[#5F5F5F] mb-[2px]">
                      Time
                    </label>
                    <TimePicker
                      value={post.time}
                      onChange={(value) => handlePostChange(index, 'time', value)}
                      placeholder="Select Time"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 pb-6 flex-shrink-0">
          <button
            onClick={handleUpdate}
            className="w-full bg-[#5046E5] text-white py-3 px-6 font-semibold rounded-full text-xl hover:bg-transparent hover:text-[#5046E5] border-2 border-[#5046E5] transition-colors duration-300"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
}
