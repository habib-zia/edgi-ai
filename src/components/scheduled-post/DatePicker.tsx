"use client";
import React, { useState } from "react";
import { DatePicker as MuiDatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function DatePicker({ value, onChange, placeholder = "Select Day" }: DatePickerProps) {
  const [open, setOpen] = useState(false);

  const handleChange = (newValue: Dayjs | null) => {
    if (newValue) {
      onChange(newValue.format('YYYY-MM-DD'));
    } else {
      onChange('');
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <MuiDatePicker
        value={value ? dayjs(value) : null}
        onChange={handleChange}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        slotProps={{
          textField: {
            placeholder: placeholder,
            fullWidth: true,
            onClick: () => setOpen(true),
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
                cursor: 'pointer',
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