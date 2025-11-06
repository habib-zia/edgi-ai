'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle } from 'lucide-react'
import ScheduleInterface from './schedule-interface'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/store'
import { setVideoError } from '@/store/slices/videoSlice'
import CreateVideoModal from './create-video-modal'
import { useSearchParams } from 'next/navigation'
import { Avatar } from '@/lib/api-service'
import { useSchedule } from '@/hooks/useSchedule'
import FormHeader from './form-header'
import FormFieldRow from './form-field-row'
import SubmitButton from './submit-button'
import FormBasicInfoSection from './form-basic-info-section'
import FormMediaSection from './form-media-section'
import SchedulePostModal from './schedule-post-modal'
import ConnectAccountsModal from './connect-accounts-modal'
import FormLoadingOverlay from './form-loading-overlay'
import AvatarSelectionStatus from './avatar-selection-status'
import { row2Fields, row3Fields } from './form-field-configs'
import { createVideoSchema, type CreateVideoFormData } from './form-validation-schema'
import UsageLimitToast from './usage-limit-toast'
import PendingPaymentToast from './pending-payment-toast'
import SubscriptionRequiredToast from './subscription-required-toast'
import { useUnifiedSocketContext } from '../providers/UnifiedSocketProvider'
import { useVoicesAndMusic } from '@/hooks/useVoicesAndMusic'
import { avatarOptions, extendedAvatarOptions, positionOptions, presetOptions, languageOptions } from './form-options'
import { createVideoFormDefaultValues } from './form-default-values'
import { useAvatarManagement } from '@/hooks/useAvatarManagement'
import { useVoiceMusicHandlers } from '@/hooks/useVoiceMusicHandlers'
import { useCityTrends } from '@/hooks/useCityTrends'
import { useCustomTopic } from '@/hooks/useCustomTopic'
import { useVideoFormToasts } from '@/hooks/useVideoFormToasts'
import { useVideoFormSubmission } from '@/hooks/useVideoFormSubmission'
import { useVideoFormEffects } from '@/hooks/useVideoFormEffects'
import { useSubscription } from '@/hooks/useSubscription'
import { useUserSettings } from '@/hooks/useUserSettings'

interface CreateVideoFormProps {
  className?: string
}

export default function CreateVideoForm({ className }: CreateVideoFormProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { isLoading, error } = useSelector((state: RootState) => state.video)
  const { user } = useSelector((state: RootState) => state.user)
  const searchParams = useSearchParams()
  const { latestAvatarUpdate } = useUnifiedSocketContext()
  const { checkVideoUsageLimit } = useSubscription()
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showConnectAccountsModal, setShowConnectAccountsModal] = useState(false)
  const [scheduleData, setScheduleData] = useState<any>(null)
  const [autoFilling, setAutoFilling] = useState(false)
  const [isFormReady, setIsFormReady] = useState(false)
  const [isScheduleMode, setIsScheduleMode] = useState(false)
  const [webhookResponse, setWebhookResponse] = useState<any>(null)
  const [isFromDefaultAvatar, setIsFromDefaultAvatar] = useState(false)
  const [userSettingsLoaded, setUserSettingsLoaded] = useState(false)
  const [savedVideoTopic, setSavedVideoTopic] = useState<string | null>(null)
  const [formManuallyTouched, setFormManuallyTouched] = useState(false)
  const { scheduleData: autoScheduleData, fetchSchedule } = useSchedule()
  const toasts = useVideoFormToasts()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger
  } = useForm<CreateVideoFormData>({
    resolver: zodResolver(createVideoSchema),
    mode: 'onSubmit',
    defaultValues: createVideoFormDefaultValues
  })

  const preset = watch('preset')
  const gender = watch('gender') || null
  const avatarManagement = useAvatarManagement({
    latestAvatarUpdate,
    setValue,
    trigger
  })

  const {
    avatars,
    avatarsLoading,
    avatarsError,
    selectedAvatars,
    fetchAvatars,
    setSelectedAvatars,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleRemoveAvatar,
    handleClearAllAvatars,
    handleAvatarClick,
    isAvatarPending,
    getAvatarType,
    isAvatarTypeAllowed,
    isAvatarSelected,
    getAvatarSelectionNumber
  } = avatarManagement

  useEffect(() => {
    const source = searchParams.get('source')
    if (source === 'defaultAvatar') setIsFromDefaultAvatar(true)
  }, [searchParams])

  useEffect(() => {
    fetchAvatars()
    fetchSchedule()
  }, [fetchAvatars, fetchSchedule])

  // Voices and music
  const {
    voices,
    voicesLoading,
    voicesError,
    musicList,
    musicLoading,
    musicError,
    allVoices,
    allMusic
  } = useVoicesAndMusic({ preset, selectedAvatars, gender })

  const voiceMusicHandlers = useVoiceMusicHandlers({ allVoices, allMusic, setValue, trigger })

  const {
    selectedVoice,
    selectedMusic,
    currentVoiceType,
    isVoiceManuallySelected,
    setSelectedVoice,
    setSelectedMusic,
    setCurrentVoiceType,
    setCurrentMusicType,
    setIsVoiceManuallySelected,
    handleVoiceClick,
    handleMusicClick,
    handleVoiceTypeChange,
    handleMusicTypeChange
  } = voiceMusicHandlers

  // City trends and custom topic
  const {
    allTrends,
    cityTrendsLoading,
    cityTrendsError,
    missingFieldsError,
    fetchCityTrends
  } = useCityTrends({ watch, setValue, trigger, savedVideoTopic })

  const {
    showCustomTopicInput,
    customTopicValue,
    keyPointsLoading,
    keyPointsError,
    setShowCustomTopicInput,
    setCustomTopicValue,
    handleCustomTopicClick,
    handleCustomTopicChange,
    handleCustomTopicBlur
  } = useCustomTopic({ setValue, trigger, formManuallyTouched })

  const handleFormFieldChange = () => setFormManuallyTouched(true)
  const handleCustomTopicChangeWithTouch = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleCustomTopicChange(e)
    setFormManuallyTouched(true)
  }

  // User settings
  const { fetchUserSettings } = useUserSettings({
    userEmail: user?.email,
    avatars,
    setSelectedAvatars,
    setValue
  })

  // Form effects
  useVideoFormEffects({
    watch,
    setValue,
    trigger,
    userEmail: user?.email,
    preset,
    gender,
    allVoices,
    allMusic,
    selectedVoice,
    selectedMusic,
    currentVoiceType,
    isVoiceManuallySelected,
    setCurrentVoiceType,
    setCurrentMusicType,
    setSelectedVoice,
    setSelectedMusic,
    showCustomTopicInput
  })

  // User settings loading effect
  useEffect(() => {
    if (!avatarsLoading && (avatars.custom.length > 0 || avatars.default.length > 0) && user?.email) {
      setAutoFilling(true)
      fetchUserSettings().then((result) => {
        if (result && !userSettingsLoaded) {
          const cityValue = watch('city')
          const videoTopicValue = watch('videoTopic')
          
          if (videoTopicValue && videoTopicValue.trim()) {
            setSavedVideoTopic(videoTopicValue)
          }
          
          const positionValue = watch('position')
          if (cityValue && cityValue.trim() && positionValue && positionValue.trim()) {
            fetchCityTrends(cityValue, positionValue)
          }
          
          setUserSettingsLoaded(true)
        }
      }).finally(() => {
        setAutoFilling(false)
        setIsFormReady(true)
      })
    } else if (!avatarsLoading && (avatars.custom.length > 0 || avatars.default.length > 0) && !user?.email) {
      setIsFormReady(true)
    }
  }, [avatarsLoading, avatars.custom.length, avatars.default.length, user?.email, fetchUserSettings, userSettingsLoaded, watch, fetchCityTrends])

  // Form submission
  const { onSubmit } = useVideoFormSubmission({
    setValue,
    watch,
    selectedAvatars,
    selectedVoice,
    selectedMusic,
    customTopicValue,
    showCustomTopicInput,
    onShowUsageToast: toasts.showUsageToastWithMessage,
    onShowPendingPayment: toasts.showPendingPaymentWithMessage,
    onShowSubscriptionRequired: toasts.showSubscriptionRequiredWithMessage,
    onModalOpen: () => setIsModalOpen(true),
    onWebhookResponseSet: setWebhookResponse
  })

  const handleToggleScheduleMode = () => setIsScheduleMode(!isScheduleMode)

  const handleDropdownSelect = (field: keyof CreateVideoFormData, value: string) => {
    setOpenDropdown(null)
    setTimeout(() => {
      if (field === 'avatar') {
        setValue('avatar', '')
      setValue('avatar', value)
      } else if (field === 'gender') {
        setValue('gender', value, { shouldValidate: true, shouldDirty: true })
        trigger('gender')
      } else if (field === 'voice') {
        const voice = voices.find(v => v.id === value)
        if (voice) {
          setIsVoiceManuallySelected(true)
          setSelectedVoice(voice)
          
        }
        setValue('voice', value)
        trigger('voice')
      } else if (field === 'music') {
        const music = musicList.find(m => m.id === value)
        if (music) {
          setSelectedMusic(music)
          
        }
        setValue('music', value)
        trigger('music')
      } else if (field === 'videoTopic') {
        setValue('videoTopic', value, { shouldValidate: true, shouldDirty: true })
        setShowCustomTopicInput(false)
        setCustomTopicValue('')
        const selectedTrend = allTrends.find(trend => trend.description === value)
        if (selectedTrend) {
          setValue('topicKeyPoints', selectedTrend.keypoints, { shouldValidate: true, shouldDirty: true })
        }
      } else {
      setValue(field, value)
    }
      trigger(field)
    }, 50)
  }


  const handleDropdownToggle = (field: keyof CreateVideoFormData) => {
    const isOpen = openDropdown === field
    
    if (isOpen) {
      const currentValue = watch(field)
      if (!currentValue || currentValue.trim() === '') {
        
        trigger(field)
        setValue(field, '', { shouldValidate: true })
      }
    }
    setOpenDropdown(isOpen ? null : field)
  }

  return (
    <div className={`w-full max-w-[1260px] mx-auto ${className} relative`}>
      <FormLoadingOverlay
        avatarsLoading={avatarsLoading}
        autoFilling={autoFilling}
        isFormReady={isFormReady}
        hasUserEmail={!!user?.email}
      />
      <FormHeader
        title="Fill the details to create video"
        onSchedulePost={() => setShowScheduleModal(true)}
        userEmail={user?.email}
        isScheduleMode={isScheduleMode}
        onToggleScheduleMode={handleToggleScheduleMode}
      />
        {isScheduleMode ? (
          <ScheduleInterface 
            onStartScheduling={() => setShowScheduleModal(true)} 
            autoScheduleData={autoScheduleData}
            onScheduleDeleted={fetchSchedule}
          />
        ) : (
      <form onSubmit={handleSubmit(onSubmit, (errors) => {
        
        const firstError = Object.values(errors)[0]
        if (firstError && 'message' in firstError) {
          dispatch(setVideoError(firstError.message as string || 'Please fix form errors'))
        }
      })} className="space-y-7">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <h3 className="text-red-800 font-semibold">Error</h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}
        <FormBasicInfoSection
          register={register}
          errors={errors}
          watch={watch}
          trigger={trigger}
          openDropdown={openDropdown}
          onDropdownToggle={handleDropdownToggle}
          onDropdownSelect={handleDropdownSelect}
          onFormFieldChange={handleFormFieldChange}
          formManuallyTouched={formManuallyTouched}
          avatarOptions={avatarOptions}
          positionOptions={positionOptions}
          isFromDefaultAvatar={isFromDefaultAvatar}
          extendedAvatarOptions={extendedAvatarOptions}
          avatars={avatars}
          avatarsLoading={avatarsLoading}
          avatarsError={avatarsError}
          selectedAvatars={selectedAvatars as { title: Avatar | null; body: Avatar | null; conclusion: Avatar | null }}
          onFetchAvatars={fetchAvatars}
          onAvatarClick={handleAvatarClick}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onRemoveAvatar={handleRemoveAvatar}
          onClearAllAvatars={handleClearAllAvatars}
          isAvatarSelected={isAvatarSelected}
          isAvatarTypeAllowed={isAvatarTypeAllowed}
          isAvatarPending={isAvatarPending}
          getAvatarSelectionNumber={getAvatarSelectionNumber}
          getAvatarType={getAvatarType}
        />
        <FormFieldRow
          fields={row2Fields}
          register={register}
          errors={errors}
          columns="4"
          watch={watch}
          trigger={trigger}
          openDropdown={openDropdown}
          onDropdownToggle={(field: string) => handleDropdownToggle(field as keyof CreateVideoFormData)}
          onDropdownSelect={(field: string, value: string) => handleDropdownSelect(field as keyof CreateVideoFormData, value)}
        />
        <FormFieldRow
          fields={row3Fields}
          register={register}
          errors={errors}
          columns="4"
          watch={watch}
          trigger={trigger}
          openDropdown={openDropdown}
          onDropdownToggle={(field: string) => handleDropdownToggle(field as keyof CreateVideoFormData)}
          onDropdownSelect={(field: string, value: string) => handleDropdownSelect(field as keyof CreateVideoFormData, value)}
          onCityBlur={(city: string) => {
            const positionValue = watch('position')
            fetchCityTrends(city, positionValue)
          }}
        />
        <FormMediaSection
          register={register}
          errors={errors}
          watch={watch}
          trigger={trigger}
          openDropdown={openDropdown}
          onDropdownToggle={handleDropdownToggle}
          onDropdownSelect={handleDropdownSelect}
          onFormFieldChange={handleFormFieldChange}
          formManuallyTouched={formManuallyTouched}
          presetOptions={presetOptions}
          languageOptions={languageOptions}
          preset={preset}
          selectedVoice={selectedVoice}
          selectedMusic={selectedMusic}
          voices={voices}
          allVoices={allVoices}
          voicesLoading={voicesLoading}
          voicesError={voicesError}
          musicList={musicList}
          allMusic={allMusic}
          musicLoading={musicLoading}
          musicError={musicError}
          onVoiceClick={handleVoiceClick}
          onVoiceTypeChange={handleVoiceTypeChange}
          onMusicClick={handleMusicClick}
          onMusicTypeChange={handleMusicTypeChange}
          allTrends={allTrends}
          cityTrendsLoading={cityTrendsLoading}
          cityTrendsError={cityTrendsError}
          missingFieldsError={missingFieldsError}
          showCustomTopicInput={showCustomTopicInput}
          customTopicValue={customTopicValue}
          keyPointsLoading={keyPointsLoading}
          keyPointsError={keyPointsError}
          onCustomTopicClick={handleCustomTopicClick}
          onCustomTopicChange={handleCustomTopicChangeWithTouch}
          onCustomTopicBlur={handleCustomTopicBlur}
          onFetchCityTrends={fetchCityTrends}
        />
        <AvatarSelectionStatus selectedAvatars={selectedAvatars} />
         <SubmitButton
           isLoading={isLoading}
           disabled={
             !selectedAvatars.title || 
             !selectedAvatars.body || 
             !selectedAvatars.conclusion ||
             (!watch('videoTopic')?.trim() && !customTopicValue.trim()) ||
             !watch('preset') ||
             !watch('voice') ||
             !watch('music') ||
             !watch('language')
           }
           loadingText="This Proccess will take up to 30-50 seconds"
           buttonText="Submit"
         />
      </form>
      )}
      {openDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            const currentValue = watch(openDropdown as keyof CreateVideoFormData)
            if (!currentValue || currentValue.trim() === '') {
              
              trigger(openDropdown as keyof CreateVideoFormData)
            }
            setOpenDropdown(null)
          }}
        />
      )}
      <CreateVideoModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setWebhookResponse(null) }}
        videoTitle={webhookResponse?.prompt || 'Custom Video'}
        webhookResponse={webhookResponse}/>
      <UsageLimitToast
        isVisible={toasts.showUsageToast}
        message={toasts.usageToastMessage}
        onClose={toasts.closeUsageToast}
        onUpgrade={() => {}}
      />
      <PendingPaymentToast
        isVisible={toasts.showPendingPaymentToast}
        message={toasts.pendingPaymentMessage}
        context="video"
        onClose={toasts.closePendingPaymentToast}
        onRefresh={async () => {
          try {
            const usageCheck = await checkVideoUsageLimit()
            if (usageCheck.canCreateVideo) {
              toasts.closePendingPaymentToast()
            } else if (usageCheck.message?.includes('payment is still being processed')) {
              toasts.showPendingPaymentWithMessage(usageCheck.message)
            } else {
              toasts.closePendingPaymentToast()
              toasts.showUsageToastWithMessage(usageCheck.message || 'Video limit reached')
            }
          } catch (error) {
          }}}/>
      <SubscriptionRequiredToast
        isVisible={toasts.showSubscriptionRequiredToast}
        message={toasts.subscriptionRequiredMessage}
        context="video"
        onClose={toasts.closeSubscriptionRequiredToast}
        onSubscribe={() => {window.location.href = '/#pricing'}}/>
      <SchedulePostModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onNext={(scheduleData) => {
          setScheduleData(scheduleData)
          setShowScheduleModal(false)
          setShowConnectAccountsModal(true)}}/>
      <ConnectAccountsModal
        isOpen={showConnectAccountsModal}
        onClose={() => { fetchSchedule(); setShowConnectAccountsModal(false) }}
        onNext={() => { setShowConnectAccountsModal(false) }}
        buttonText="Schedule Post"
        scheduleData={scheduleData}
        onCreatePost={() => {setShowConnectAccountsModal(false)}}
        onScheduleCreated={fetchSchedule}/>
    </div>
  )
}