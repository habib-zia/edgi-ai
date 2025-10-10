"use client";
import React from "react";
import { Select, MenuItem, FormControl, SelectChangeEvent } from "@mui/material";

interface FrequencyDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

const frequencyOptions = [
  "Once a Week",
  "Twice a Week", 
  "Three Times a Week",
  "Daily",
  "Custom"
];

export default function FrequencyDropdown({ value, onChange }: FrequencyDropdownProps) {
  const handleChange = (event: SelectChangeEvent) => {
    onChange(event.target.value);
  };

  return (
    <FormControl fullWidth>
      <Select
        value={value}
        onChange={handleChange}
        displayEmpty
        sx={{
          backgroundColor: '#EEEEEE',
          borderRadius: '8px',
          border: 'none',
          '& .MuiOutlinedInput-notchedOutline': {
            border: 'none',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            border: 'none',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            border: '2px solid #5046E5',
          },
          '& .MuiSelect-select': {
            padding: '11px 16px',
            fontSize: '18px',
            color: '#11101066',
          },
          '& .MuiSelect-icon': {
            color: '#11101066',
            fontSize: '34px',
          }
        }}
      >
        {frequencyOptions.map((option) => (
          <MenuItem 
            key={option} 
            value={option}
            sx={{
              fontSize: '18px',
              color: '#11101066',
              '&:hover': {
                backgroundColor: '#F5F5F5',
              },
              '&.Mui-selected': {
                backgroundColor: '#5046E5',
                color: '#FFFFFF',
                '&:hover': {
                  backgroundColor: '#5046E5',
                }
              }
            }}
          >
            {option}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
