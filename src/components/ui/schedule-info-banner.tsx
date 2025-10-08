'use client'

import React from 'react'
import { Info } from 'lucide-react'

interface ScheduleInfoBannerProps {
    className?: string
    startDate?: string | null
}

export default function ScheduleInfoBanner({ className = '', startDate }: ScheduleInfoBannerProps) {
    // Use the provided startDate or calculate next month's date
    const displayDate = startDate || (() => {
        const today = new Date()
        const currentDay = today.getDate()
        const currentMonth = today.getMonth()
        const currentYear = today.getFullYear()
        
        // Get the last day of next month
        const nextMonth = new Date(currentYear, currentMonth + 1, 0)
        const lastDayOfNextMonth = nextMonth.getDate()
        
        // Use the same day if it exists, otherwise use the last day of next month
        const targetDay = Math.min(currentDay, lastDayOfNextMonth)
        
        const nextMonthDate = new Date(currentYear, currentMonth + 1, targetDay)

        // Format as DD-MMM-YYYY (e.g., "07-NOV-2025")
        const day = nextMonthDate.getDate().toString().padStart(2, '0')
        const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
            'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
        const month = monthNames[nextMonthDate.getMonth()]
        const year = nextMonthDate.getFullYear()

        return `${day}-${month}-${year}`
    })()

    return (
        <div className={`rounded-lg p-4 flex items-start gap-3 ${className}`} style={{ backgroundColor: '#EF99431A', borderColor: '#EF9943', borderWidth: '1px', borderStyle: 'solid' }}>
            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: '#EF99431A' }}>
                <Info className="w-4 h-4" style={{ color: '#EF9943' }} />
            </div>
            <p className="text-sm" style={{ color: '#EF9943' }}>
                These posts will be scheduled for whole month and this schedule will starts from {displayDate}.
            </p>
        </div>
    )
}
