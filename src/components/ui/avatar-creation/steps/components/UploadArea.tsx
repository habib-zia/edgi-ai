'use client'

import { Upload } from "lucide-react"

interface UploadAreaProps {
  isDragging: boolean
  isProcessing: boolean
  onDragEnter: (e: React.DragEvent) => void
  onDragLeave: (e: React.DragEvent) => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
  onFileSelect: () => void
  fileInputRef: React.RefObject<HTMLInputElement | null>
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export default function UploadArea({
  isDragging,
  isProcessing,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onFileSelect,
  fileInputRef,
  onInputChange
}: UploadAreaProps) {
  return (
    <div 
      className={`border-[2px] rounded-[8px] p-8 max-w-full w-full border-dashed transition-all min-h-[100px] duration-300 ${
        isDragging 
          ? 'border-[#6366F1] bg-[#6366F1]/5 border-2' 
          : 'border-[#D1D5DB]'
      } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="flex flex-col items-center justify-center gap-6 h-full">
        <button 
          onClick={onFileSelect}
          disabled={isProcessing}
          className="text-[#6366F1] font-medium transition-colors duration-300 hover:text-[#5046E5] text-[16px] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload className="w-4 h-4" />
          Upload a pre-recorded video
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
          onChange={onInputChange}
          className="hidden"
        />
        
        {isProcessing && (
          <p className="text-[14px] text-[#5F5F5F]">Processing video...</p>
        )}
      </div>
    </div>
  )
}
