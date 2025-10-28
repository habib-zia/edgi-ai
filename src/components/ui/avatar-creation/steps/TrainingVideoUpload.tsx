'use client'

import { useState } from "react";
import { X, CheckCircle, AlertCircle } from "lucide-react";
import { useVideoUpload } from "../../../../hooks/useVideoUpload";

interface AvatarData {
  name: string
  age: string
  gender: string
  ethnicity: string
  videoFile: File | null
  consentVideoFile: File | null
  photoFiles: File[]
  avatarType: 'digital-twin' | 'photo-avatar' | null
}

interface TrainingVideoUploadProps {
  onNext: () => void
  onBack: () => void
  avatarData: AvatarData
  setAvatarData: (data: AvatarData) => void
}

export default function TrainingVideoUpload({ onNext, onBack, avatarData, setAvatarData }: TrainingVideoUploadProps) {
  const [avatarName, setAvatarName] = useState(avatarData.name || '');
  const trainingUpload = useVideoUpload();

  const handleAvatarNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setAvatarName(name);
    setAvatarData({ ...avatarData, name });
  };

  const handleTrainingInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    trainingUpload.handleInputChange(e, 'training');
    if (e.target.files && e.target.files[0]) {
      setAvatarData({ ...avatarData, videoFile: e.target.files[0] });
    }
  };

  const clearTrainingSelection = () => {
    trainingUpload.clearSelection();
    setAvatarData({ ...avatarData, videoFile: null });
  };

  const canProceed = avatarData.videoFile && trainingUpload.uploadState.isValid && !trainingUpload.uploadState.isValidating && avatarName.trim().length > 0;

  return (
    <div className="bg-white flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 className="text-[32px] font-bold text-[#101010]">
          Digital Twin
        </h2>
        <button
          onClick={onBack}
          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors duration-200"
        >
          <span className="text-xl font-bold text-gray-600">×</span>
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="text-center mb-10">
          <h2 className="text-[24px] font-semibold text-[#101010] mb-6 tracking-[-2%] leading-[120%]">
            Upload your footage
          </h2>
          <p className="text-[18px] text-[#5F5F5F] max-w-[710px] mx-auto leading-[24px]">
            For optimal, most test realistic results, we recommend uploading a 2min video recorded with a high-resolution for optimal avatar creation.
          </p>
        </div>

        <div className="w-full max-w-md mb-8">
          <label htmlFor="avatarName" className="block text-[14px] font-medium text-[#101010] mb-2">
            Avatar Name
          </label>
          <input
            id="avatarName"
            type="text"
            value={avatarName}
            onChange={handleAvatarNameChange}
            placeholder="Enter your avatar name"
            className="w-full px-4 py-3 border border-[#D1D5DB] rounded-lg text-[14px] text-[#101010] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:border-transparent transition-all duration-200"
          />
        </div>

        <div className="w-full max-w-2xl">
          <h3 className="text-[18px] font-semibold text-[#101010] mb-4">Drag and drop training video</h3>
          <div
            className={`border-[2px] rounded-[8px] p-8 border-dashed transition-all min-h-[300px] duration-300 ${trainingUpload.getBorderClasses('training')}`}
            onDragEnter={(e) => trainingUpload.handleDragEnter(e, 'training')}
            onDragLeave={trainingUpload.handleDragLeave}
            onDragOver={trainingUpload.handleDragOver}
            onDrop={(e) => trainingUpload.handleDrop(e, 'training')}
          >
            {!avatarData.videoFile ? (
              <div className="flex flex-col items-center justify-center gap-6 h-full">
                <div className="text-center">
                  <h4 className="text-[20px] font-semibold text-[#101010] mb-4">
                    Drag and drop training video
                  </h4>
                  <p className="text-[14px] text-[#5F5F5F] text-center mb-6">
                    MP4 or MOV format, 2-3 minutes, minimum 720p
                  </p>
                  <button
                    onClick={() => trainingUpload.fileInputRef.current?.click()}
                    className="text-[#6366F1] font-normal transition-colors duration-300 hover:text-[#5046E5] text-[16px]"
                  >
                    Browse local files
                  </button>
                </div>
                <input
                  ref={trainingUpload.fileInputRef}
                  type="file"
                  accept="video/mp4,video/quicktime,.mp4,.mov"
                  onChange={handleTrainingInputChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {trainingUpload.uploadState.preview && (
                  <div className="relative rounded-lg overflow-hidden bg-black">
                    <video
                      ref={trainingUpload.videoRef}
                      src={trainingUpload.uploadState.preview}
                      controls
                      className="w-full max-h-[200px] object-contain"
                    />
                  </div>
                )}

                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-[14px] font-medium text-[#101010] truncate">
                        {avatarData.videoFile.name}
                      </p>
                      {trainingUpload.uploadState.isValidating && (
                        <span className="text-[10px] text-[#6366F1]">Validating...</span>
                      )}
                      {trainingUpload.uploadState.isValid && !trainingUpload.uploadState.isValidating && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                      {trainingUpload.uploadState.errors.length > 0 && !trainingUpload.uploadState.isValidating && (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <p className="text-[12px] text-[#5F5F5F]">
                      {(avatarData.videoFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>

                    {trainingUpload.uploadState.errors.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {trainingUpload.uploadState.errors.map((error, index) => (
                          <div key={index} className="flex items-start gap-1 text-red-600 text-[12px]">
                            <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            <span>{error.message}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {trainingUpload.uploadState.isValid && !trainingUpload.uploadState.isValidating && (
                      <div className="mt-2 flex items-start gap-1 text-green-600 text-[12px]">
                        <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        <span>Training video is valid</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={clearTrainingSelection}
                    className="p-1 hover:bg-[#F3F4F6] rounded-lg transition-colors duration-300"
                    title="Clear selection"
                  >
                    <X className="w-4 h-4 text-[#5F5F5F]" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={onNext}
          disabled={!canProceed}
          className={`px-8 py-[11.3px] font-semibold text-[20px] mt-12 rounded-full transition-all duration-300 w-full max-w-md border-2 ${
            canProceed
              ? 'bg-[#5046E5] text-white hover:text-[#5046E5] hover:bg-transparent border-[#5046E5] cursor-pointer'
              : 'bg-[#D1D5DB] text-[#9CA3AF] border-[#D1D5DB] cursor-not-allowed'
          }`}
        >
          {trainingUpload.uploadState.isValidating ? 'Validating...' : 'Next'}
        </button>
      </div>
    </div>
  );
}
