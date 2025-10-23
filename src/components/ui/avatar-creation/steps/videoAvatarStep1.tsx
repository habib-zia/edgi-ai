'use client'

import { useState } from "react";
import { X, CheckCircle, AlertCircle } from "lucide-react";
import { useVideoUpload } from "../../../../hooks/useVideoUpload";
import { apiService } from "../../../../lib/api-service";

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

interface VideoAvatarStep1Props {
  onNext: () => void
  avatarData: AvatarData
  setAvatarData: (data: AvatarData) => void
}



export default function VideoAvatarStep1({ onNext, avatarData, setAvatarData }: VideoAvatarStep1Props) {
  const [avatarName, setAvatarName] = useState(avatarData.name || '');
  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Debug error message changes
  console.log('🔍 Current error message:', errorMessage);

  const consentUpload = useVideoUpload();
  const trainingUpload = useVideoUpload();

  const handleAvatarNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setAvatarName(name);
    setAvatarData({ ...avatarData, name });
  };

  const handleConsentFileSelect = async (file: File) => {
    await consentUpload.handleFileSelect(file, 'consent');
    setAvatarData({ ...avatarData, consentVideoFile: file });
  };

  const handleTrainingFileSelect = async (file: File) => {
    await trainingUpload.handleFileSelect(file, 'training');
    setAvatarData({ ...avatarData, videoFile: file });
  };

  const handleConsentInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    consentUpload.handleInputChange(e, 'consent');
    if (e.target.files && e.target.files[0]) {
      setAvatarData({ ...avatarData, consentVideoFile: e.target.files[0] });
    }
  };

  const handleTrainingInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    trainingUpload.handleInputChange(e, 'training');
    if (e.target.files && e.target.files[0]) {
      setAvatarData({ ...avatarData, videoFile: e.target.files[0] });
    }
  };

  const clearConsentSelection = () => {
    consentUpload.clearSelection();
    setAvatarData({ ...avatarData, consentVideoFile: null });
  };

  const clearTrainingSelection = () => {
    trainingUpload.clearSelection();
    setAvatarData({ ...avatarData, videoFile: null });
  };

  const handleContinue = async () => {
    if (!avatarData.consentVideoFile || !avatarData.videoFile) {
      return;
    }

    setIsCreating(true);
    setErrorMessage(null);
    
    try {
      const response = await apiService.createVideoAvatar(
        avatarData.videoFile,
        avatarData.consentVideoFile,
        avatarName
      );

      if (response.success) {
        console.log('✅ Video avatar created successfully:', response.data);
        onNext();
      } else {
        console.error('❌ Failed to create video avatar:', response.message);
        console.log('🔍 Setting error message:', response.message);
        setErrorMessage(response.message || 'Failed to create video avatar');
      }
    } catch (error) {
      console.error('❌ Error creating video avatar:', error);
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const canProceed = avatarData.consentVideoFile && avatarData.videoFile && consentUpload.uploadState.isValid && trainingUpload.uploadState.isValid && !consentUpload.uploadState.isValidating && !trainingUpload.uploadState.isValidating && avatarName.trim().length > 0;

  return (
    <div className="bg-white flex flex-col h-full">
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="text-center mb-10">
          <h2 className="text-[24px] font-semibold text-[#101010] mb-6 tracking-[-2%] leading-[120%]">
            Upload your videos
          </h2>
          <p className="text-[18px] text-[#5F5F5F] max-w-[710px] mx-auto leading-[24px]">
            Upload both a consent video (max 20 seconds) and a training video (2-3 minutes) for optimal avatar creation.
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-6xl">
          <div className="space-y-4">
            <h3 className="text-[18px] font-semibold text-[#101010]">Consent Video</h3>
        <div 
              className={`border-[2px] rounded-[8px] p-6 border-dashed transition-all min-h-[200px] duration-300 ${consentUpload.getBorderClasses('consent')}`}
              onDragEnter={(e) => consentUpload.handleDragEnter(e, 'consent')}
              onDragLeave={consentUpload.handleDragLeave}
              onDragOver={consentUpload.handleDragOver}
              onDrop={(e) => consentUpload.handleDrop(e, 'consent')}
            >
              {!avatarData.consentVideoFile ? (
                <div className="flex flex-col items-center justify-center gap-4 h-full">
                  <h4 className="text-[16px] font-semibold text-[#101010]">
                    Drag and drop consent video
                  </h4>
                  <p className="text-[12px] text-[#5F5F5F] text-center">
                    MP4 or MOV format, max 20 seconds, minimum 720p
              </p>
              <button 
                    onClick={() => consentUpload.fileInputRef.current?.click()}
                className="text-[#6366F1] font-normal transition-colors duration-300 hover:text-[#5046E5] text-[14px]"
              >
                    Browse files
              </button>
              <input
                    ref={consentUpload.fileInputRef}
                type="file"
                    accept="video/mp4,video/quicktime,.mp4,.mov"
                    onChange={handleConsentInputChange}
                className="hidden"
              />
            </div>
          ) : (
                <div className="flex flex-col gap-3">
                  {consentUpload.uploadState.preview && (
                <div className="relative rounded-lg overflow-hidden bg-black">
                  <video
                        ref={consentUpload.videoRef}
                        src={consentUpload.uploadState.preview}
                    controls
                        className="w-full max-h-[150px] object-contain"
                      />
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-[14px] font-medium text-[#101010] truncate">
                          {avatarData.consentVideoFile.name}
                        </p>
                        {consentUpload.uploadState.isValidating && (
                          <span className="text-[10px] text-[#6366F1]">Validating...</span>
                        )}
                        {consentUpload.uploadState.isValid && !consentUpload.uploadState.isValidating && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                        {consentUpload.uploadState.errors.length > 0 && !consentUpload.uploadState.isValidating && (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                      <p className="text-[12px] text-[#5F5F5F]">
                        {(avatarData.consentVideoFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>

                      {consentUpload.uploadState.errors.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {consentUpload.uploadState.errors.map((error, index) => (
                            <div key={index} className="flex items-start gap-1 text-red-600 text-[12px]">
                              <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                              <span>{error.message}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {consentUpload.uploadState.isValid && !consentUpload.uploadState.isValidating && (
                        <div className="mt-2 flex items-start gap-1 text-green-600 text-[12px]">
                          <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <span>Consent video is valid</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={clearConsentSelection}
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

          <div className="space-y-4">
            <h3 className="text-[18px] font-semibold text-[#101010]">Training Video</h3>
            <div
              className={`border-[2px] rounded-[8px] p-6 border-dashed transition-all min-h-[200px] duration-300 ${trainingUpload.getBorderClasses('training')}`}
              onDragEnter={(e) => trainingUpload.handleDragEnter(e, 'training')}
              onDragLeave={trainingUpload.handleDragLeave}
              onDragOver={trainingUpload.handleDragOver}
              onDrop={(e) => trainingUpload.handleDrop(e, 'training')}
            >
              {!avatarData.videoFile ? (
                <div className="flex flex-col items-center justify-center gap-4 h-full">
                  <h4 className="text-[16px] font-semibold text-[#101010]">
                    Drag and drop training video
                  </h4>
                  <p className="text-[12px] text-[#5F5F5F] text-center">
                    MP4 or MOV format, 2-3 minutes, minimum 720p
                  </p>
                  <button
                    onClick={() => trainingUpload.fileInputRef.current?.click()}
                    className="text-[#6366F1] font-normal transition-colors duration-300 hover:text-[#5046E5] text-[14px]"
                  >
                    Browse files
                  </button>
                  <input
                    ref={trainingUpload.fileInputRef}
                    type="file"
                    accept="video/mp4,video/quicktime,.mp4,.mov"
                    onChange={handleTrainingInputChange}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {trainingUpload.uploadState.preview && (
                    <div className="relative rounded-lg overflow-hidden bg-black">
                      <video
                        ref={trainingUpload.videoRef}
                        src={trainingUpload.uploadState.preview}
                        controls
                        className="w-full max-h-[150px] object-contain"
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
        </div>


        <button
          onClick={handleContinue}
          disabled={!canProceed || isCreating}
          className={`px-8 py-[11.3px] font-semibold text-[20px] mt-12 rounded-full transition-all duration-300 w-full max-w-md border-2 ${canProceed && !isCreating
              ? 'bg-[#5046E5] text-white hover:text-[#5046E5] hover:bg-transparent border-[#5046E5] cursor-pointer'
              : 'bg-[#D1D5DB] text-[#9CA3AF] border-[#D1D5DB] cursor-not-allowed'
          }`}
        >
          {isCreating ? 'Creating Avatar...' : consentUpload.uploadState.isValidating || trainingUpload.uploadState.isValidating ? 'Validating...' : 'Continue'}
        </button>
      </div>
    </div>
  );
}