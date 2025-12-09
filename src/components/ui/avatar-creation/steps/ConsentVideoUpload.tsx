'use client'

import { useState, useEffect } from "react";
import { X, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { useVideoUpload } from "../../../../hooks/useVideoUpload";
import { apiService } from "../../../../lib/api-service";
import { AvatarData } from '../AvatarCreationModal'
import { trainingVideoNameRef } from './TrainingVideoUpload'
import { useUnifiedSocketContext } from "../../../../components/providers/UnifiedSocketProvider";
import { useNotificationStore } from '../../global-notification'

interface ConsentVideoUploadProps {
  onNext: () => void
  onBack: () => void
  onClose?: () => void
  avatarData: AvatarData
  setAvatarData: (data: AvatarData) => void
  onCreateStart?: () => void
}

export default function ConsentVideoUpload({ onNext, onBack, onClose, avatarData, setAvatarData, onCreateStart }: ConsentVideoUploadProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const consentUpload = useVideoUpload();
  const { videoAvatarUpdates } = useUnifiedSocketContext();
  const { showNotification } = useNotificationStore();

  useEffect(() => {
    if (avatarData.consentVideoFile && !consentUpload.uploadState.preview) {
      consentUpload.handleFileSelect(avatarData.consentVideoFile, 'consent');
    }
  }, [avatarData.consentVideoFile]);

  useEffect(() => {
    if (isCreating && videoAvatarUpdates.length > 0) {
      const latestUpdate = videoAvatarUpdates[videoAvatarUpdates.length - 1];
      if (latestUpdate.status === 'progress' || latestUpdate.status === 'error') {
        console.log('🎬 Video avatar status update, closing modal:', latestUpdate.status);
        if (onClose) {
          onClose();
        }
      }
    }
  }, [videoAvatarUpdates, isCreating, onClose]);

  const handleConsentInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    consentUpload.handleInputChange(e, 'consent');
    if (e.target.files && e.target.files[0]) {
      setAvatarData({ ...avatarData, consentVideoFile: e.target.files[0] });
    }
  };

  const handleConsentDrop = async (e: React.DragEvent) => {
    consentUpload.handleDrop(e, 'consent');
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      setAvatarData({ ...avatarData, consentVideoFile: files[0] });
    }
  };

  const clearConsentSelection = () => {
    consentUpload.clearSelection();
    setAvatarData({ ...avatarData, consentVideoFile: null });
  };

  const handleCreate = async () => {
    if (!avatarData.consentVideoFile || !avatarData.videoFile) {
      return;
    }

    setIsCreating(true);
    setErrorMessage(null);
    
    if (onCreateStart) {
      onCreateStart();
    }
    
    const avatarName = trainingVideoNameRef.current || avatarData.name || '';
    try {
      const result = await apiService.createVideoAvatar(
        avatarData.videoFile,
        avatarData.consentVideoFile,
        avatarName
      );
      
      if (result.success) {
        // Reset loading state
        setIsCreating(false);
        
        // Show success toast
        showNotification('Your video avatar request created successfully', 'success');
        
        // Close modal
        if (onClose) {
          onClose();
        }
        return;
      } else {
        console.error('❌ Video avatar creation failed:', result.message);
        setIsCreating(false);
        if (onClose) {
          onClose();
        }
      }
    } catch (error) {
      console.error('❌ Exception creating video avatar:', error);
      setIsCreating(false);
      if (onClose) {
        onClose();
      }
    }
  };

  const canProceedConsent = avatarData.consentVideoFile && consentUpload.uploadState.isValid && !consentUpload.uploadState.isValidating;

  return (
    <div className="bg-white flex flex-col h-full">
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="text-center mb-10 w-full max-w-[900px] mx-auto">
          <h2 className="text-[24px] font-semibold text-[#101010] mb-6 tracking-[-2%] leading-[120%]">
            Upload your footage
          </h2>
          <p className="text-[18px] text-[#5F5F5F] max-w-[710px] mx-auto leading-[24px]">
            Record a consent video to authorize the use of your footage for avatar creation.
          </p>
        </div>

        <div className="w-full max-w-[900px] space-y-6">
          {/* Record Consent Section */}
          <div className="space-y-4">
            <h3 className="text-[18px] font-semibold text-[#101010]">Record Consent</h3>
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <p className="text-[16px] text-[#5F5F5F] leading-[24px]">
                I, <strong>{trainingVideoNameRef.current || avatarData.name || '[full name]'}</strong>, hereby allow HeyGen to use the footage of me to build a HeyGen Avatar for use on the HeyGen platform.
              </p>
            </div>
          </div>

          {/* Drag and drop consent video */}
          <div className="space-y-4">
            <h3 className="text-[18px] font-semibold text-[#101010]">Drag and drop consent video</h3>
            <div
              className={`border-[2px] rounded-[8px] p-8 border-dashed transition-all min-h-[300px] duration-300 ${consentUpload.getBorderClasses('consent')}`}
              onDragEnter={(e) => consentUpload.handleDragEnter(e, 'consent')}
              onDragLeave={(e) => consentUpload.handleDragLeave(e, 'consent')}
              onDragOver={consentUpload.handleDragOver}
              onDrop={handleConsentDrop}
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
                  {(consentUpload.uploadState.preview || avatarData.consentVideoFile) && (
                    <div className="relative rounded-lg overflow-hidden bg-black">
                      <video
                        ref={consentUpload.videoRef}
                        src={consentUpload.uploadState.preview || (avatarData.consentVideoFile ? URL.createObjectURL(avatarData.consentVideoFile) : '')}
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

        {/* Error Message */}
        {errorMessage && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-[14px]">{errorMessage}</p>
          </div>
        )}
        <div className="w-full flex flex-col gap-4 mt-12 max-w-[900px]">
          {isCreating ? (
            <p className="px-8 py-[11.3px] font-semibold text-[20px] text-center text-[#5F5F5F]">
              Your avatar is being created! Usually takes 2-3 minutes.
            </p>
          ) : (
            <>
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-[#5F5F5F] hover:text-[#101010] transition-colors duration-200 font-medium text-[14px] self-start"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                onClick={handleCreate}
                disabled={!canProceedConsent}
                className={`px-8 py-[11.3px] font-semibold text-[20px] rounded-full transition-all duration-300 w-full border-2 ${canProceedConsent
                    ? 'bg-[#5046E5] text-white hover:text-[#5046E5] hover:bg-transparent border-[#5046E5] cursor-pointer'
                    : 'bg-[#D1D5DB] text-[#9CA3AF] border-[#D1D5DB] cursor-not-allowed'
                  }`}
              >
                {consentUpload.uploadState.isValidating ? 'Validating...' : 'Create'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
