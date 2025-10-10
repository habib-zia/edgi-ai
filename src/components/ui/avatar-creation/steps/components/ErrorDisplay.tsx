'use client'

import { X, AlertCircle } from "lucide-react"

interface ErrorDisplayProps {
  error: string | null
  cameraError: string | null
  onClear: () => void
}

export default function ErrorDisplay({ error, cameraError, onClear }: ErrorDisplayProps) {
  if (!error && !cameraError) return null

  return (
    <div className="mb-6 max-w-[600px] w-full">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-[14px] text-red-800">{error || cameraError}</p>
        </div>
        <button
          onClick={onClear}
          className="text-red-600 hover:text-red-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
