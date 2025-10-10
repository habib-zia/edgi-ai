"use client";
import React, { useState } from "react";
import ScheduledPostCard from "./ScheduledPostCard";
import ModifyScheduleModal from "./ModifyScheduleModal";

// Mock data for scheduled posts
const scheduledPostsData = [
  {
    id: 1,
    topic: "Video Topic",
    title: "Topic Title Here",
    caption: "This is the caption that will be posted on the",
    platform: "Youtube",
    date: "15 May 2020 10:00 pm"
  },
  {
    id: 2,
    topic: "Video Topic",
    title: "Topic Title Here",
    caption: "This is the caption that will be posted on the",
    platform: "Youtube",
    date: "15 May 2020 10:00 pm"
  },
  {
    id: 3,
    topic: "Video Topic",
    title: "Topic Title Here",
    caption: "This is the caption that will be posted on the",
    platform: "Youtube",
    date: "15 May 2020 10:00 pm"
  },
  {
    id: 4,
    topic: "Video Topic",
    title: "Topic Title Here",
    caption: "This is the caption that will be posted on the",
    platform: "Youtube",
    date: "15 May 2020 10:00 pm"
  },
  {
    id: 5,
    topic: "Video Topic",
    title: "Topic Title Here",
    caption: "This is the caption that will be posted on the",
    platform: "Youtube",
    date: "15 May 2020 10:00 pm"
  },
  {
    id: 6,
    topic: "Video Topic",
    title: "Topic Title Here",
    caption: "This is the caption that will be posted on the",
    platform: "Youtube",
    date: "15 May 2020 10:00 pm"
  },
  {
    id: 7,
    topic: "Video Topic",
    title: "Topic Title Here",
    caption: "This is the caption that will be posted on the",
    platform: "Youtube",
    date: "15 May 2020 10:00 pm"
  },
  {
    id: 8,
    topic: "Video Topic",
    title: "Topic Title Here",
    caption: "This is the caption that will be posted on the",
    platform: "Youtube",
    date: "15 May 2020 10:00 pm"
  },
  {
    id: 9,
    topic: "Video Topic",
    title: "Topic Title Here",
    caption: "This is the caption that will be posted on the",
    platform: "Youtube",
    date: "15 May 2020 10:00 pm"
  }
];

export default function ScheduledPostsGrid() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleModifySchedule = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      {/* Section Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="text-2xl !font-semibold md:text-[40px] text-[#171717]">
          Scheduled Posts
        </h2>
        
        {/* Modify Schedule Button */}
        <button 
          onClick={handleModifySchedule}
          className="flex items-center gap-2 px-4 py-[8px] border-2 border-[#5046E5] text-[#5046E5] rounded-full text-xl font-semibold hover:bg-[#5046E5]
         hover:text-white transition-colors duration-300">
          <svg width="20" height="22" viewBox="0 0 20 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 0C15.523 0 20 4.477 20 10C20 15.523 15.523 20 10 20C4.477 20 0 15.523 0 10C0 4.477 4.477 0 10 0ZM10 2C7.87827 2 5.84344 2.84285 4.34315 4.34315C2.84285 5.84344 2 7.87827 2 10C2 12.1217 2.84285 14.1566 4.34315 15.6569C5.84344 17.1571 7.87827 18 10 18C12.1217 18 14.1566 17.1571 15.6569 15.6569C17.1571 14.1566 18 12.1217 18 10C18 7.87827 17.1571 5.84344 15.6569 4.34315C14.1566 2.84285 12.1217 2 10 2ZM10 4C10.2449 4.00003 10.4813 4.08996 10.6644 4.25272C10.8474 4.41547 10.9643 4.63975 10.993 4.883L11 5V9.586L13.707 12.293C13.8863 12.473 13.9905 12.7144 13.9982 12.9684C14.006 13.2223 13.9168 13.4697 13.7488 13.6603C13.5807 13.8508 13.3464 13.9703 13.0935 13.9944C12.8406 14.0185 12.588 13.9454 12.387 13.79L12.293 13.707L9.293 10.707C9.13758 10.5514 9.03776 10.349 9.009 10.131L9 10V5C9 4.73478 9.10536 4.48043 9.29289 4.29289C9.48043 4.10536 9.73478 4 10 4Z" fill="currentColor"/>
          </svg>

          Modify Schedule
        </button>
      </div>
      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scheduledPostsData.map((post) => (
          <ScheduledPostCard key={post.id} post={post} />
        ))}
      </div>

      {/* Modify Schedule Modal */}
      <ModifyScheduleModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
      />
    </div>
  );
}
