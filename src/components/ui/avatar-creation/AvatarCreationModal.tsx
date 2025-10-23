'use client'

import { useEffect, useState } from 'react'
import Step2ChooseType from './steps/Step2ChooseType'
import Step5QRCode from './steps/Step5QRCode'
import Step6PhotoInstructions from './steps/Step6PhotoInstructions'
import Step7PhotoUpload from './steps/Step7PhotoUpload'
import Step8Details from './steps/Step8Details'
import Step9AvatarReady from './steps/Step9AvatarReady'
import Step1Intro from './steps/Step1Intro'
import VideoAvatarStep1 from './steps/videoAvatarStep1'
import VideoAvatarStep2 from './steps/videoAvatarStep2'
import VideoAvatarStep4 from './steps/videoAvatarStep4'
import VideoAvatarStep5 from './steps/videoAvatarStep5'
import DigitalTwinGuidelines from './steps/DigitalTwinGuidelines'

export type AvatarType = 'digital-twin' | 'photo-avatar'

interface AvatarData {
  name: string
  age: string
  gender: string
  ethnicity: string
  videoFile: File | null
  consentVideoFile: File | null
  photoFiles: File[]
  avatarType: AvatarType | null
}

interface AvatarCreationModalProps {
  isOpen: boolean
  onClose: () => void
  onShowToast?: (message: string, type: 'success' | 'error' | 'info') => void
}

export default function AvatarCreationModal({ isOpen, onClose, onShowToast }: AvatarCreationModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedAvatarType, setSelectedAvatarType] = useState<AvatarType | null>(null)
  const [avatarData, setAvatarData] = useState<AvatarData>({
    name: '',
    age: '',
    gender: '',
    ethnicity: '',
    videoFile: null,
    consentVideoFile: null,
    photoFiles: [],
    avatarType: null
  })

    // Prevent body scroll when modal is open
    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = 'unset'
      }
  
      // Cleanup function to reset overflow when component unmounts
      return () => {
        document.body.style.overflow = 'unset'
      }
    }, [isOpen])

  const handleNext = () => {
    // For digital-twin: Normal progression through steps 3 -> 4 -> 8
    setCurrentStep(prev => prev + 1)
  }


  const handleSkipBackToUpload = () => {
    // Skip back to step 3 (Upload options)
    // This skips step 4 (WebcamRecord) and step 5 (QRCode) when going backward
    setCurrentStep(3)
  }

  const handleBack = () => {
    setCurrentStep(prev => prev - 1)
  }

  const handleAvatarTypeSelect = (type: AvatarType) => {
    setSelectedAvatarType(type)
    setAvatarData(prev => ({ ...prev, avatarType: type }))
    // Don't auto-advance - user needs to click Next
  }

  const handleAvatarTypeNext = () => {
    if (selectedAvatarType) {
      handleNext()
    }
  }

  const handleClose = () => {
    setCurrentStep(1)
    setSelectedAvatarType(null)
    setAvatarData({
      name: '',
      age: '',
      gender: '',
      ethnicity: '',
      videoFile: null,
      consentVideoFile: null,
      photoFiles: [],
      avatarType: null
    })
    onClose()
  }

  const handleAvatarCreationSuccess = () => {
    // Close modal immediately - WebSocket will handle progress notifications
    handleClose()
  }

  const handleSetAvatarData = (data: AvatarData) => {
    setAvatarData(data)
  }

  // Helper function to check if current step needs narrow width (Step6PhotoInstructions, Step7PhotoUpload, Step8Details, or Step9AvatarReady)
  const isNarrowWidth = () => {
    return (currentStep === 3 && selectedAvatarType === 'photo-avatar') ||
           (currentStep === 4 && selectedAvatarType === 'photo-avatar') ||
           (currentStep === 5 && selectedAvatarType === 'photo-avatar') ||
           (currentStep === 5 && selectedAvatarType === 'digital-twin') ||
           (currentStep === 6 && selectedAvatarType === 'photo-avatar') ||
           (currentStep === 9 && selectedAvatarType === 'digital-twin')
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Intro onNext={handleNext} />
      
      case 2:
        return <Step2ChooseType 
          onAvatarTypeSelect={handleAvatarTypeSelect} 
          onAvatarTypeNext={handleAvatarTypeNext}
          selectedType={selectedAvatarType}
        />
      
      case 3:
        if (selectedAvatarType === 'digital-twin') {
          return <DigitalTwinGuidelines onNext={handleNext} onBack={handleBack} />
        } else {
          return (
            <Step6PhotoInstructions 
              onNext={handleNext}
              onBack={handleBack}
            />
          )
        }
      
      case 4:
        if (selectedAvatarType === 'digital-twin') {
          return <VideoAvatarStep1 onNext={handleNext} avatarData={avatarData} setAvatarData={handleSetAvatarData} />
        } else {
          return (
            <Step7PhotoUpload 
              onNext={handleNext}
              onBack={handleBack}
              avatarData={avatarData}
              setAvatarData={handleSetAvatarData}
            />
          )
        }
      
      case 5:
        if (selectedAvatarType === 'digital-twin') {
          return <VideoAvatarStep2 onNext={handleNext} avatarData={avatarData} setAvatarData={handleSetAvatarData} />
        } else {
          return (
            <Step8Details 
              onBack={handleBack}
              avatarData={avatarData}
              setAvatarData={handleSetAvatarData}
              onClose={handleAvatarCreationSuccess}
            />
          )
        }
      
      case 6:
        if (selectedAvatarType === 'digital-twin') {
          return (
            <VideoAvatarStep4
              onNext={handleNext}
            />
          )
        } else {
          return (
            <Step9AvatarReady 
              onNext={handleNext}
              onBack={handleBack}
              avatarData={avatarData}
              setAvatarData={handleSetAvatarData}
            />
          )
        }
      
      case 7:
        if (selectedAvatarType === 'digital-twin') {
          return (
            <VideoAvatarStep5
              onBack={handleBack}
              avatarData={avatarData}
              setAvatarData={handleSetAvatarData}
              onSkipBackToUpload={handleSkipBackToUpload}
              onClose={handleAvatarCreationSuccess}
              onShowToast={onShowToast}
            />
          )
        } else {
          return null
        }

      case 9:
        if (selectedAvatarType === 'digital-twin') {
          return <VideoAvatarStep4 onNext={handleAvatarCreationSuccess} />
        }
        break
      
      default:
        return <Step1Intro onNext={handleNext} />
    }
  }


  // Dynamic modal sizing based on current step
  const getModalDimensions = () => {
    if (selectedAvatarType == 'digital-twin' && (currentStep == 3 || currentStep == 4 || currentStep == 5)) {
      return {
        maxWidth: isNarrowWidth() ? 'max-w-[760px]' : 'max-w-[900px]',
        maxHeight: 'max-h-[650px]',
        padding: ''
      }
    }
    return {
      maxWidth: isNarrowWidth() ? 'max-w-[760px]' : 'max-w-[1100px]',
      maxHeight: 'max-h-[840px]',
      padding: 'p-3'
    }
  }

  const modalDimensions = getModalDimensions()
  console.log('modalDimensions', modalDimensions)


  if (!isOpen) return null

  return (
    <div className={`fixed inset-0 bg-black/80 flex items-center justify-center z-50 ${modalDimensions.padding}`}>
      <div className={`bg-white rounded-[12px] md:px-8 px-4 md:pb-8 pb-4 md:pt-6 pt-4 ${modalDimensions.maxWidth} w-full ${modalDimensions.maxHeight} h-full flex flex-col relative ${selectedAvatarType === 'digital-twin' ? 'avatar-dropdown-shadow' : ''}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="md:text-[32px] text-[24px] font-semibold text-[#282828]">Create Avatar</h2>
          <button
            onClick={handleClose}
            className="cursor-pointer"
            aria-label="Close avatar creation modal"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.5 1.5L1.5 22.5M1.5 1.5L22.5 22.5" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto">
          {renderStep()}
        </div>
      </div>
    </div>
  )
}
