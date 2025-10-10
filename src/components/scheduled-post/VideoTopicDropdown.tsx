"use client";
import React, { useState, useRef, useEffect } from "react";

interface VideoTopicDropdownProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const videoTopics = [
  "Technology",
  "Business",
  "Education",
  "Entertainment",
  "Lifestyle",
  "Health & Fitness",
  "Travel",
  "Food & Cooking",
  "Sports",
  "News & Politics",
  "Science",
  "Art & Design",
  "Music",
  "Gaming",
  "Fashion",
  "Other"
];

export default function VideoTopicDropdown({ value, onChange, placeholder = "Please Specify" }: VideoTopicDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (topic: string) => {
    onChange(topic);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        className="w-full bg-[#EEEEEE] rounded-[8px] px-4 py-3 cursor-pointer hover:bg-gray-200 transition-colors flex items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`text-base ${value ? 'text-[#282828]' : 'text-[#11101066]'}`}>
          {value || placeholder}
        </span>
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 16 16" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className={`text-[#11101066] transition-transform ${isOpen ? 'rotate-180' : ''}`}
        >
          <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      
      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#F1F1F4] rounded-[8px] shadow-lg z-10 max-h-60 overflow-y-auto">
          {videoTopics.map((topic) => (
            <div
              key={topic}
              className={`px-4 py-3 text-sm cursor-pointer hover:bg-gray-50 transition-colors ${
                topic === value ? 'text-[#5046E5] bg-[#5046E510]' : 'text-[#282828]'
              }`}
              onClick={() => handleSelect(topic)}
            >
              {topic}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
