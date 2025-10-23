"use client";
import React from "react";

interface CaptionsTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
}

export default function CaptionsTextarea({ 
  value, 
  onChange, 
  placeholder = "Enter Caption", 
  rows = 4,
  disabled = false
}: CaptionsTextareaProps) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <textarea
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      className={`w-full rounded-[8px] px-4 py-3 text-base text-[#282828] placeholder-[#11101066] resize-none focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:ring-opacity-50 transition-all ${
        disabled 
          ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
          : 'bg-[#EEEEEE] focus:bg-white'
      }`}
      style={{
        border: 'none',
        outline: 'none',
      }}
    />
  );
}
