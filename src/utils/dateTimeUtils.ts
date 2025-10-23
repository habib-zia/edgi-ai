/**
 * Utility functions for date and time formatting
 */

/**
 * Format a date string to a localized date format
 * @param dateString - Date string in format "YYYY-MM-DD HH:mm:ss" or similar
 * @returns Formatted date string (e.g., "Oct 23, 2025")
 */
export const formatDate = (dateString: string): string => {
  // Parse the date string and treat it as UTC
  // Format: "2025-10-23 11:50:00" -> "2025-10-23T11:50:00Z"
  const utcDateString = dateString.replace(' ', 'T') + 'Z';
  const date = new Date(utcDateString);
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: userTimezone
  });
};

/**
 * Format a date string to a localized time format
 * @param dateString - Date string in format "YYYY-MM-DD HH:mm:ss" or similar
 * @returns Formatted time string (e.g., "4:50 PM")
 */
export const formatTime = (dateString: string): string => {
  // Parse the date string and treat it as UTC
  // Format: "2025-10-23 11:50:00" -> "2025-10-23T11:50:00Z"
  const utcDateString = dateString.replace(' ', 'T') + 'Z';
  const date = new Date(utcDateString);
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  const localTime = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: userTimezone
  });
  
  return localTime;
};

/**
 * Format a date string to a localized date and time format
 * @param dateString - Date string in format "YYYY-MM-DD HH:mm:ss" or similar (UTC)
 * @returns Formatted date and time string (e.g., "Oct 23, 2025, 4:50 PM")
 */
export const formatDateTime = (dateString: string): string => {
  // Parse the date string and treat it as UTC
  // Format: "2025-10-23 11:50:00" -> "2025-10-23T11:50:00Z"
  const utcDateString = dateString.replace(' ', 'T') + 'Z';
  const date = new Date(utcDateString);
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  const formattedDateTime = date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: userTimezone
  });
  
  return formattedDateTime;
};

/**
 * Get current date in YYYY-MM-DD format
 * @returns Current date string
 */
export const getCurrentDate = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get current time in HH:mm format
 * @returns Current time string
 */
export const getCurrentTime = (): string => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
 * Get minimum time for today (current time + specified minutes)
 * @param minutes - Number of minutes to add to current time (default: 45)
 * @returns Minimum time string in HH:mm format
 */
export const getMinTimeForToday = (minutes: number = 45): string => {
  const now = new Date();
  const minTime = new Date(now.getTime() + minutes * 60 * 1000);
  return minTime.toTimeString().slice(0, 5);
};

/**
 * Check if a post is scheduled soon (within specified minutes)
 * @param dateString - Date string of the post
 * @param timeString - Time string of the post
 * @param minutes - Number of minutes to check (default: 40)
 * @returns True if post is scheduled within the specified minutes
 */
export const isPostScheduledSoon = (
  dateString: string, 
  timeString: string, 
  minutes: number = 40
): boolean => {
  const selectedDate = new Date(dateString);
  const today = new Date();
  const isToday = selectedDate.toDateString() === today.toDateString();
  
  if (isToday && timeString) {
    const now = new Date();
    const minTime = new Date(now.getTime() + minutes * 60 * 1000);
    const selectedTime = new Date(`${dateString}T${timeString}:00`);
    const minTimeForToday = new Date(`${dateString}T${minTime.toTimeString().slice(0, 5)}:00`);
    
    return selectedTime < minTimeForToday;
  }
  
  return false;
};

/**
 * Clean date string by extracting date part from various formats
 * @param dateString - Date string that may contain time or other parts
 * @returns Clean date string in YYYY-MM-DD format
 */
export const getCleanDate = (dateString?: string): string => {
  if (!dateString) return "";
  
  if (dateString.includes('T')) {
    return dateString.split('T')[0];
  } else if (dateString.includes(' ')) {
    return dateString.split(' ')[0];
  } else {
    return dateString;
  }
};

/**
 * Convert a formatted date string from UTC to local timezone
 * @param dateString - Date string in format "Oct 23, 2025, 11:50 AM" (UTC)
 * @returns Formatted date and time string in local timezone (e.g., "Oct 23, 2025, 4:50 PM")
 */
export const convertUTCToLocal = (dateString: string): string => {
  if (!dateString) return "";
  
  try {
    // Parse the formatted date string as UTC
    const date = new Date(dateString + ' UTC');
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    const formattedDateTime = date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: userTimezone
    });
    
    return formattedDateTime;
  } catch (error) {
    console.error('Error converting UTC to local time:', error);
    return dateString; // Return original if conversion fails
  }
};

/**
 * Convert a formatted date string from UTC to local timezone (date only)
 * @param dateString - Date string in format "Oct 23, 2025, 11:50 AM" (UTC)
 * @returns Formatted date string in local timezone (e.g., "Oct 23, 2025")
 */
export const convertUTCToLocalDate = (dateString: string): string => {
  if (!dateString) return "";
  
  try {
    const date = new Date(dateString + ' UTC');
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    const formattedDate = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: userTimezone
    });
    
    return formattedDate;
  } catch (error) {
    console.error('Error converting UTC to local date:', error);
    return dateString;
  }
};

/**
 * Convert a formatted date string from UTC to local timezone (time only)
 * @param dateString - Date string in format "Oct 23, 2025, 11:50 AM" (UTC)
 * @returns Formatted time string in local timezone (e.g., "4:50 PM")
 */
export const convertUTCToLocalTime = (dateString: string): string => {
  if (!dateString) return "";
  
  try {
    const date = new Date(dateString + ' UTC');
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    const formattedTime = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: userTimezone
    });
    
    return formattedTime;
  } catch (error) {
    console.error('Error converting UTC to local time:', error);
    return dateString;
  }
};
