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
  const [currentStep, setCurrentStep] = useState<'training' | 'consent'>('training');

  // Debug error message changes
  console.log('🔍 Current error message:', errorMessage);

  const consentUpload = useVideoUpload();
  const trainingUpload = useVideoUpload();

  const handleAvatarNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setAvatarName(name);
    setAvatarData({ ...avatarData, name });
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

  const handleTrainingNext = () => {
    if (avatarData.videoFile && trainingUpload.uploadState.isValid && !trainingUpload.uploadState.isValidating && avatarName.trim().length > 0) {
      setCurrentStep('consent');
    }
  };

  const handleCreate = async () => {
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
          setTimeout(async () => {
            setIsCreating(false);
            window.location.reload();
          }, 5000)

      } else {
        setIsCreating(false);
        console.error('❌ Failed to create video avatar:', response.message);
        console.log('🔍 Setting error message:', response.message);
        setErrorMessage(response.message || 'Failed to create video avatar');
      }
    } catch (error) {
      setIsCreating(false);
      console.error('❌ Error creating video avatar:', error);
      setErrorMessage('An unexpected error occurred. Please try again.');
    }
  };

  const canProceedTraining = avatarData.videoFile && trainingUpload.uploadState.isValid && !trainingUpload.uploadState.isValidating && avatarName.trim().length > 0;
  const canProceedConsent = avatarData.consentVideoFile && consentUpload.uploadState.isValid && !consentUpload.uploadState.isValidating;

  return (
    <div className="bg-white flex flex-col h-full">
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {currentStep === 'training' ? (
          <>
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
              onClick={handleTrainingNext}
              disabled={!canProceedTraining}
              className={`px-8 py-[11.3px] font-semibold text-[20px] mt-12 rounded-full transition-all duration-300 w-full max-w-md border-2 ${
                canProceedTraining
                  ? 'bg-[#5046E5] text-white hover:text-[#5046E5] hover:bg-transparent border-[#5046E5] cursor-pointer'
                  : 'bg-[#D1D5DB] text-[#9CA3AF] border-[#D1D5DB] cursor-not-allowed'
              }`}
            >
              {trainingUpload.uploadState.isValidating ? 'Validating...' : 'Next'}
            </button>
          </>
        ) : (
          <>
            <div className="text-center mb-10">
              <h2 className="text-[24px] font-semibold text-[#101010] mb-6 tracking-[-2%] leading-[120%]">
                Upload your footage
              </h2>
              <p className="text-[18px] text-[#5F5F5F] max-w-[710px] mx-auto leading-[24px]">
                Record a consent video to authorize the use of your footage for avatar creation.
              </p>
            </div>
            <div className="w-full max-w-2xl space-y-6">
              <div className="space-y-4">
                <h3 className="text-[18px] font-semibold text-[#101010]">Record Consent</h3>
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <p className="text-[16px] text-[#5F5F5F] leading-[24px]">
                    I, <strong>{'[full name]'}</strong>, hereby allow HeyGen to use the footage of me to build a HeyGen Avatar for use on the HeyGen platform.
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-[18px] font-semibold text-[#101010]">Drag and drop consent video</h3>
                <div
                  className={`border-[2px] rounded-[8px] p-8 border-dashed transition-all min-h-[300px] duration-300 ${consentUpload.getBorderClasses('consent')}`}
                  onDragEnter={(e) => consentUpload.handleDragEnter(e, 'consent')}
                  onDragLeave={consentUpload.handleDragLeave}
                  onDragOver={consentUpload.handleDragOver}
                  onDrop={(e) => consentUpload.handleDrop(e, 'consent')}
                >
                  {!avatarData.consentVideoFile ? (
                    <div className="flex flex-col items-center justify-center gap-6 h-full">
                      <div className="text-center">
                        <h4 className="text-[20px] font-semibold text-[#101010] mb-4">
                          Drag and drop consent video
                        </h4>
                        <p className="text-[14px] text-[#5F5F5F] text-center mb-6">
                          MP4 or MOV format, max 20 seconds, minimum 720p
                        </p>
                        <button
                          onClick={() => consentUpload.fileInputRef.current?.click()}
                          className="text-[#6366F1] font-normal transition-colors duration-300 hover:text-[#5046E5] text-[16px]"
                        >
                          Browse local files
                        </button>
                      </div>
                      <input
                        ref={consentUpload.fileInputRef}
                        type="file"
                        accept="video/mp4,video/quicktime,.mp4,.mov"
                        onChange={handleConsentInputChange}
                        className="hidden"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {consentUpload.uploadState.preview && (
                        <div className="relative rounded-lg overflow-hidden bg-black">
                          <video
                            ref={consentUpload.videoRef}
                            src={consentUpload.uploadState.preview}
                            controls
                            className="w-full max-h-[200px] object-contain"
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
            </div>
            {errorMessage && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-[14px]">{errorMessage}</p>
              </div>
            )}
            <button
              onClick={handleCreate}
              disabled={!canProceedConsent || isCreating}
              className={`px-8 py-[11.3px] font-semibold text-[20px] mt-12 rounded-full transition-all duration-300 w-full max-w-md border-2 ${
                canProceedConsent && !isCreating
                  ? 'bg-[#5046E5] text-white hover:text-[#5046E5] hover:bg-transparent border-[#5046E5] cursor-pointer'
                  : 'bg-[#D1D5DB] text-[#9CA3AF] border-[#D1D5DB] cursor-not-allowed'
              }`}
            >
              {isCreating ? 'Creating Avatar...' : consentUpload.uploadState.isValidating ? 'Validating...' : 'Create'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}