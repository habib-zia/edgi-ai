"use client";
import React, { useState, useRef, useEffect } from "react";
import { getPlatformIcon } from "../report-analytics/PlatformIcon";

interface CaptionsDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

const platforms = [
  { name: "Instagram" },
  { name: "Facebook" },
  { name: "X" },
  { name: "LinkedIn" },
  { name: "TikTok" },
  { name: "YouTube" }
];

export default function CaptionsDropdown({ value, onChange }: CaptionsDropdownProps) {
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

  const handleSelect = (platform: string) => {
    onChange(platform);
    setIsOpen(false);
  };

  const selectedPlatform = platforms.find(p => p.name === value) || platforms[0];

  return (
    <div className="relative z-[100]" ref={dropdownRef}>
      <div 
        className="flex items-center gap-2 px-3 py-2 bg-[#EEEEEE] rounded-[7px] cursor-pointer hover:bg-gray-200 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="w-5 h-5 flex items-center justify-center">
          {getPlatformIcon(selectedPlatform.name)}
        </div>
        <span className="text-sm font-medium text-[#282828]">{selectedPlatform.name}</span>
        <svg 
          width="12" 
          height="12" 
          viewBox="0 0 12 12" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className={`text-[#858999] transition-transform ${isOpen ? 'rotate-180' : ''}`}
        >
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      
      {/* Dropdown Menu */}
      {isOpen && (
        <div className="fixed bg-white border border-[#F1F1F4] rounded-lg shadow-lg z-[9999] min-w-[160px]" 
             style={{
               top: dropdownRef.current ? dropdownRef.current.getBoundingClientRect().bottom + 8 : 0,
               right: dropdownRef.current ? window.innerWidth - dropdownRef.current.getBoundingClientRect().right : 0
             }}>
          {platforms.map((platform) => (
            <div
              key={platform.name}
              className={`flex items-center gap-3 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 transition-colors ${
                platform.name === value ? 'text-[#5046E5] bg-[#5046E510]' : 'text-[#282828]'
              }`}
              onClick={() => handleSelect(platform.name)}
            >
              <div className="w-5 h-5 flex items-center justify-center">
                {getPlatformIcon(platform.name)}
              </div>
              <span className="font-medium">{platform.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
