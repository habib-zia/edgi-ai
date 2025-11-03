'use client'

interface CircularProgressProps {
  progress: number
  size?: number
}

export default function CircularProgress({ progress, size = 32 }: CircularProgressProps) {
  const radius = (size - 8) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference
  const strokeWidth = 2
  
  return (
    <svg width={size} height={size} className="absolute inset-0 -top-1 -left-1">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#EBE9FE"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#5046E5"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        className="transition-all duration-100 ease-linear"
      />
    </svg>
  )
}

