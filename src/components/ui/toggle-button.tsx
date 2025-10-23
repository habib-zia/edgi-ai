'use client';

import React from 'react';

interface ToggleButtonProps {
  options: {
    value: string;
    label: string;
  }[];
  selectedValue: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function ToggleButton({ 
  options, 
  selectedValue, 
  onChange, 
  className = '' 
}: ToggleButtonProps) {
  return (
    <div className={`inline-flex rounded-full border-2 border-[#5046E5] overflow-hidden ${className}`}>
      {options.map((option, index) => {
        const isSelected = selectedValue === option.value;
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`
              px-6 py-3 text-sm font-medium transition-all duration-200 min-w-[120px] rounded-full
              ${isSelected 
                ? 'bg-[#5046E5] text-white' 
                : 'bg-white text-[#5046E5] hover:bg-[#5046E5]/5'
              }
              ${index === 0 ? 'rounded-l-md' : ''}
              ${index === options.length - 1 ? 'rounded-r-md' : ''}
            `}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
