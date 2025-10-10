"use client";
import React from "react";

interface CaptionsTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

export default function CaptionsTextarea({ 
  value, 
  onChange, 
  placeholder = "Enter Caption", 
  rows = 4 
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
      className="w-full bg-[#EEEEEE] rounded-[8px] px-4 py-3 text-base text-[#282828] placeholder-[#11101066] resize-none focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:ring-opacity-50 transition-all"
      style={{
        border: 'none',
        outline: 'none',
      }}
    />
  );
}
