"use client";
import React from "react";
import { MobileTimePicker } from "@mui/x-date-pickers/MobileTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function TimePicker({ value, onChange, placeholder = "Select Time" }: TimePickerProps) {
  const handleChange = (newValue: Dayjs | null) => {
    if (newValue) {
      onChange(newValue.format('HH:mm'));
    } else {
      onChange('');
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <MobileTimePicker
        value={value ? dayjs(`2000-01-01 ${value}`) : null}
        onChange={handleChange}
        slotProps={{
          textField: {
            placeholder: placeholder,
            fullWidth: true,
            sx: {
              backgroundColor: '#EEEEEE',
              borderRadius: '8px',
              '& .MuiOutlinedInput-notchedOutline': {
                border: 'none',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                border: 'none',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                border: '2px solid #5046E5',
              },
              '& input': {
                padding: '10px 16px',
                fontSize: '18px',
                color: '#11101066',
                '&::placeholder': {
                  color: '#11101066',
                  opacity: 1,
                }
              }
            }
          }
        }}
        sx={{
          '& .MuiInputAdornment-root': {
            color: '#11101066',
          },
          '& .MuiIconButton-root': {
            color: '#11101066',
          }
        }}
      />
    </LocalizationProvider>
  );
}