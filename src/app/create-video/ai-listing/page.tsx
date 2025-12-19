"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { IoMdArrowDropdown } from "react-icons/io";
import { AlertCircle } from 'lucide-react';
import ProtectedRoute from "@/components/features/auth/ProtectedRoute";
import Link from "next/link";
import HybridTopicInput from '@/components/ui/hybrid-topic-input';
import FormInput from '@/components/ui/form-input';
import FormDropdown from '@/components/ui/form-dropdown';
import { apiService, Avatar } from '@/lib/api-service';
import { Trend } from '@/lib/api-service';
import { useNotificationStore } from '@/components/ui/global-notification';
import { useUnifiedSocketContext } from '@/components/providers/UnifiedSocketProvider';

// Form validation schema
const aiListingSchema = z.object({
  name: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Full name can only contain letters and spaces'),
  avatar: z.string().min(1, 'Please select an avatar'),
  language: z.string().min(1, 'Please select a language'),
  city: z.string()
    .min(2, 'City must be at least 2 characters')
    .max(50, 'City must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'City can only contain letters and spaces'),
  videoTopic: z.string()
    .min(1, 'Please enter a valid topic or key points.')
    .max(100, 'Topic must be less than 100 characters'),
});

type AiListingFormData = z.infer<typeof aiListingSchema>;

const avatarOptions = [
  { value: 'Gorilla-1', label: 'Gorilla 1' },
  { value: 'Shawheen', label: 'Shawheen' },
  { value: 'Verified HeyGen Avatar', label: 'Verified HeyGen Avatar' },
  { value: 'Varied', label: 'Varied' }
];

const extendedAvatarOptions = [
  { value: 'Gorilla-1', label: 'Gorilla 1' },
  { value: 'Shawheen', label: 'Shawheen' },
  { value: 'Verified HeyGen Avatar', label: 'Verified HeyGen Avatar' },
  { value: 'Varied', label: 'Varied' },
  { value: 'SHF34020', label: 'SHF34020' },
  { value: 'FRM89034', label: 'FRM89034' },
  { value: 'VAL77889', label: 'VAL77889' },
  { value: 'PIP34567', label: 'PIP34567' },
  { value: 'PN100234', label: 'PN100234' },
  { value: 'CON11223', label: 'CON11223' },
  { value: 'XTR12340', label: 'XTR12340' },
  { value: 'DRV34567', label: 'DRV34567' },
  { value: 'BLD67543', label: 'BLD67543' },
  { value: 'Account', label: 'Account' },
  { value: 'FRM11223', label: 'FRM11223' },
  { value: 'SHF56789', label: 'SHF56789' }
];

const languageOptions = [
  { value: 'English', label: 'English' },
  { value: 'Spanish', label: 'Spanish' },
];

export default function AiListingPage() {
  const { showNotification } = useNotificationStore();
  const { latestAvatarUpdate } = useUnifiedSocketContext();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [cityTrends, setCityTrends] = useState<Trend[]>([]);
  const [cityTrendsLoading, setCityTrendsLoading] = useState(false);
  const [cityTrendsError, setCityTrendsError] = useState<string | null>(null);
  const [lastFetchedCity, setLastFetchedCity] = useState<string | null>(null);
  const [showCustomTopicInput, setShowCustomTopicInput] = useState(false);
  const [customTopicValue, setCustomTopicValue] = useState('');
  const [keyPointsLoading, setKeyPointsLoading] = useState(false);
  const [keyPointsError, setKeyPointsError] = useState<string | null>(null);
  const [formManuallyTouched, setFormManuallyTouched] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  
  // Avatar state (same as simple form)
  const [isFromDefaultAvatar] = useState(false);
  const [avatars, setAvatars] = useState<{ custom: Avatar[]; default: Avatar[] }>({ custom: [], default: [] });
  const [avatarsLoading, setAvatarsLoading] = useState(false);
  const [avatarsError, setAvatarsError] = useState<string | null>(null);
  const [selectedAvatars, setSelectedAvatars] = useState<{
    title: Avatar | null;
    body: Avatar | null;
    conclusion: Avatar | null;
  }>({
    title: null,
    body: null,
    conclusion: null,
  });
  const [draggedAvatar, setDraggedAvatar] = useState<Avatar | null>(null);
  
  const languageDropdownRef = useRef<HTMLDivElement>(null);
  const cityDropdownRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger,
  } = useForm<AiListingFormData>({
    resolver: zodResolver(aiListingSchema),
    defaultValues: {
      name: '',
      avatar: '',
      language: '',
      city: '',
      videoTopic: '',
    },
  });

  const safeCityTrends = Array.isArray(cityTrends) ? cityTrends : [];
  const allTrends = safeCityTrends;

  // Fetch avatars function
  const fetchAvatars = useCallback(async () => {
    try {
      setAvatarsLoading(true);
      setAvatarsError(null);
      const response = await apiService.getAvatars();

      if (response.success) {
        const avatarData = (response as any).data || response;
        const customAvatars = (avatarData as any).custom || (response as any).custom || [];
        const defaultAvatars = (avatarData as any).default || (response as any).default || [];

        setAvatars({
          custom: customAvatars,
          default: defaultAvatars,
        });
        setAvatarsError(null);
      } else {
        setAvatarsError(response.message || 'Failed to fetch avatars');
      }
    } catch (error: any) {
      if (error.message?.includes('Not Found') || error.message?.includes('404')) {
        setAvatarsError('Avatar API not yet implemented. Using fallback options.');
      } else {
        setAvatarsError(error.message || 'Failed to load avatars');
      }
    } finally {
      setAvatarsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAvatars();
  }, [fetchAvatars]);

  useEffect(() => {
    if (latestAvatarUpdate) {
      const isAvatarComplete =
        (latestAvatarUpdate.step === 'complete' ||
          latestAvatarUpdate.step === 'ready') &&
        latestAvatarUpdate.status === 'success' &&
        (latestAvatarUpdate.data?.message?.toLowerCase().includes('avatar') ||
          latestAvatarUpdate.data?.message?.toLowerCase().includes('ready'));

      if (isAvatarComplete) {
        setTimeout(() => {
          fetchAvatars();
        }, 1000);
      }
    }
  }, [latestAvatarUpdate, fetchAvatars]);

  // Helper functions for avatar
  const isAvatarPending = (avatar: Avatar) => {
    const isCustomAvatar = avatars.custom.some(
      (customAvatar) => customAvatar.avatar_id === avatar.avatar_id
    );
    return (
      isCustomAvatar &&
      (avatar.status === 'pending' ||
        avatar.status === 'processing' ||
        avatar.status === 'creating')
    );
  };

  const getAvatarType = (avatar: Avatar): 'custom' | 'default' => {
    return avatars.custom.some(
      (customAvatar) => customAvatar.avatar_id === avatar.avatar_id
    )
      ? 'custom'
      : 'default';
  };

  const isAvatarTypeAllowed = (_avatar: Avatar): boolean => {
    return true;
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, avatar: Avatar) => {
    e.stopPropagation();
    setDraggedAvatar(avatar);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', avatar.avatar_id);
    const target = e.target as HTMLElement;
    target.classList.add('dragging');
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.stopPropagation();
    const target = e.target as HTMLElement;
    target.classList.remove('dragging');
    setDraggedAvatar(null);
  };

  const handleAvatarDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    const target = e.currentTarget as HTMLElement;
    target.classList.add('drag-over');
  };

  const handleAvatarDragLeave = (e: React.DragEvent) => {
    e.stopPropagation();
    const target = e.currentTarget as HTMLElement;
    target.classList.remove('drag-over');
  };

  const handleAvatarDrop = (
    e: React.DragEvent,
    dropZone: 'title' | 'body' | 'conclusion'
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const target = e.currentTarget as HTMLElement;
    target.classList.remove('drag-over');

    if (draggedAvatar) {
      if (!isAvatarTypeAllowed(draggedAvatar)) {
        setDraggedAvatar(null);
        return;
      }

      // Only allow single avatar selection - always use title slot
      setSelectedAvatars({
        title: draggedAvatar,
        body: null,
        conclusion: null,
      });

      setValue('avatar', draggedAvatar.avatar_id);
      trigger('avatar');
    }
    setDraggedAvatar(null);
  };

  const handleRemoveAvatar = (dropZone: 'title' | 'body' | 'conclusion') => {
    // Only clear the single avatar (title slot)
    setSelectedAvatars({
      title: null,
      body: null,
      conclusion: null,
    });

    setValue('avatar', '');
    trigger('avatar');
  };

  const handleClearAllAvatars = () => {
    setSelectedAvatars({
      title: null,
      body: null,
      conclusion: null,
    });
    setValue('avatar', '');
    trigger('avatar');
  };

  const handleAvatarClick = (avatar: Avatar) => {
    if (isAvatarPending(avatar)) {
      return;
    }

    // Check if this avatar is already selected (only check title slot for single selection)
    const isSelected = selectedAvatars.title?.avatar_id === avatar.avatar_id;

    if (isSelected) {
      // Deselect the avatar
      setSelectedAvatars({
        title: null,
        body: null,
        conclusion: null,
      });
      setValue('avatar', '');
      trigger('avatar');
    } else {
      // Select this avatar (replace any existing selection)
      if (!isAvatarTypeAllowed(avatar)) {
        return;
      }

      setSelectedAvatars({
        title: avatar,
        body: null,
        conclusion: null,
      });
      setValue('avatar', avatar.avatar_id);
      trigger('avatar');
    }
  };

  const isAvatarSelected = (avatar: Avatar) => {
    // Only check title slot for single selection
    return selectedAvatars.title?.avatar_id === avatar.avatar_id;
  };

  const getAvatarSelectionNumber = (avatar: Avatar) => {
    // Return null for single selection (no numbers shown)
    return null;
  };

  // Fetch city trends function (without position requirement)
  const fetchCityTrends = useCallback(async (city: string) => {
    const cityValue = city?.trim() || '';
    
    if (!cityValue) {
      setCityTrends([]);
      setLastFetchedCity(null);
      setCityTrendsError(null);
      return;
    }
    
    // Don't fetch if we already have trends for this city
    if (cityValue === lastFetchedCity) {
      return;
    }

    try {
      setCityTrendsLoading(true);
      setCityTrendsError(null);
      
      const response = await apiService.getCityTrends(cityValue);
      
      if (response.success && response.data) {
        const trendsData = response.data.trends;
        if (Array.isArray(trendsData)) {
          setCityTrends(trendsData);
          setLastFetchedCity(cityValue);
        } else {
          setCityTrendsError('Invalid city trends data format');
          setCityTrends([]);
        }
      } else {
        const errorMessage = response.message || response.error || 'Failed to fetch city trends';
        setCityTrendsError(errorMessage);
        setCityTrends([]);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch city trends';
      setCityTrendsError(errorMessage);
      setCityTrends([]);
    } finally {
      setCityTrendsLoading(false);
    }
  }, [lastFetchedCity]);

  // Watch city changes and fetch trends
  const watchedCity = watch('city');
  useEffect(() => {
    if (watchedCity && watchedCity.trim()) {
      const timeoutId = setTimeout(() => {
        fetchCityTrends(watchedCity);
      }, 500); // Debounce
      return () => clearTimeout(timeoutId);
    }
  }, [watchedCity, fetchCityTrends]);

  // Click outside to close dropdowns (FormDropdown handles its own state)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Handle avatar dropdown separately
      if (openDropdown === 'avatar') {
        const isInsideButton = target.closest('.avatar-dropdown-button');
        const isInsideModal = target.closest('.avatar-dropdown-modal');
        
        if (!isInsideButton && !isInsideModal) {
          setOpenDropdown(null);
        }
        return;
      }
      
      // Handle other dropdowns
      if (
        languageDropdownRef.current &&
        !languageDropdownRef.current.contains(event.target as Node) &&
        cityDropdownRef.current &&
        !cityDropdownRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  const handleDropdownToggle = (field: string) => {
    setOpenDropdown(openDropdown === field ? null : field);
  };

  const handleDropdownSelect = (field: keyof AiListingFormData, value: string) => {
    if (field === 'avatar') {
      // Avatar is handled by handleAvatarClick, but we still need to update form value
      setValue(field, value, { shouldValidate: true, shouldDirty: true });
    } else {
      setValue(field, value, { shouldValidate: true, shouldDirty: true });
    }
    setOpenDropdown(null);
    trigger(field);
    setFormManuallyTouched(true);
  };

  const handleCustomTopicClick = () => {
    setShowCustomTopicInput(true);
    setCustomTopicValue('');
    setOpenDropdown(null);
    setValue('videoTopic', '', { shouldValidate: false, shouldDirty: true });
  };

  const handleCustomTopicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomTopicValue(value);
    setFormManuallyTouched(true);
  };

  // Generate key points for custom topic
  const generateCustomTopicKeyPoints = useCallback(async (description: string) => {
    if (!description || !description.trim()) return;

    try {
      setKeyPointsLoading(true);
      setKeyPointsError(null);

      const response = await apiService.getDescriptionKeypoints(description);
      
      if (response.success && response.data) {
        const keypoints = response.data.keypoints || '';
        if (keypoints.trim()) {
          setValue('videoTopic', description.trim(), { shouldValidate: true, shouldDirty: true });
          setLastApiTriggeredValue(description.trim());
        }
      } else {
        setKeyPointsError(response.message || 'Failed to generate key points');
      }
    } catch (error: any) {
      setKeyPointsError(error.message || 'Failed to generate key points');
    } finally {
      setKeyPointsLoading(false);
    }
  }, [setValue]);

  const [lastApiTriggeredValue, setLastApiTriggeredValue] = useState<string>('');

  const handleCustomTopicBlur = () => {
    if (customTopicValue && customTopicValue.trim()) {
      if (customTopicValue.trim() === lastApiTriggeredValue) return;
      generateCustomTopicKeyPoints(customTopicValue);
    }
  };

  const renderDropdown = (
    field: keyof AiListingFormData,
    options: { value: string; label: string }[],
    placeholder: string,
    ref?: React.RefObject<HTMLDivElement | null>
  ) => {
    const currentValue = watch(field);
    const isOpen = openDropdown === field;
    const shouldShowErrors = formManuallyTouched || submitAttempted;
    const filteredErrors = shouldShowErrors ? errors : {};
    const hasError = filteredErrors[field];

    return (
      <div className="relative" ref={ref}>
        <div className="relative">
          <input
            type="text"
            value={options.find(opt => opt.value === currentValue)?.label || ''}
            readOnly
            onClick={() => handleDropdownToggle(field)}
            placeholder={placeholder}
            className={`w-full px-4 py-[13.5px] text-[14px] font-normal bg-[#F5F5F5] hover:bg-[#EEEEEE] border-0 rounded-[8px] text-left transition-all duration-300 focus:outline-none focus:ring focus:ring-[#5046E5] focus:bg-white cursor-pointer ${hasError ? 'ring-2 ring-red-500' : ''} ${currentValue ? 'text-gray-800' : 'text-[#11101066]'}`}
          />
          <button
            type="button"
            onClick={() => handleDropdownToggle(field)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <IoMdArrowDropdown
              className={`w-4 h-4 transition-transform text-black duration-300 ${isOpen ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
        {isOpen && (
          <div className="absolute z-[9999] top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleDropdownSelect(field, option.value)}
                className="w-full px-4 py-3 text-left text-gray-800 hover:bg-[#F5F5F5] transition-colors duration-200"
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
        {hasError && (
          <p className="text-red-500 text-sm mt-1 flex items-center gap-1" role="alert">
            <AlertCircle className="w-4 h-4" />
            {(hasError as any).message}
          </p>
        )}
      </div>
    );
  };

  const renderTrendsDropdown = (field: keyof AiListingFormData, placeholder: string) => {
    const currentValue = watch(field);
    const isValidDropdownValue = allTrends.some(trend => trend.description === currentValue);
    const displayValue = isValidDropdownValue ? currentValue : '';
    const selectedTrend = allTrends.find(trend => trend.description === displayValue);
    const isOpen = openDropdown === field;
    const shouldShowErrors = formManuallyTouched || submitAttempted;
    const filteredErrors = shouldShowErrors ? errors : {};
    const hasError = showCustomTopicInput && field === 'videoTopic' ? null : filteredErrors[field];
    const isLoading = cityTrendsLoading;
    const combinedError = cityTrendsError;
    const cityValue = watch('city');
    const canShowCustomTopic = cityValue && cityValue.trim();

    return (
      <HybridTopicInput
        field={field}
        placeholder={placeholder}
        currentValue={displayValue}
        selectedTrend={selectedTrend}
        isOpen={isOpen}
        hasError={hasError}
        trendsLoading={isLoading}
        trendsError={combinedError}
        safeTrends={allTrends}
        onToggle={handleDropdownToggle}
        onSelect={handleDropdownSelect}
        onBlur={() => {}}
        onRetry={() => {
          if (cityValue && cityValue.trim()) {
            fetchCityTrends(cityValue);
          }
        }}
        onCustomTopicClick={canShowCustomTopic ? handleCustomTopicClick : undefined}
      />
    );
  };

  const onSubmit = async (data: AiListingFormData) => {
    setSubmitAttempted(true);
    
    // Validate custom topic if shown
    if (showCustomTopicInput) {
      if (!customTopicValue.trim()) {
        showNotification('Please enter a custom topic', 'error');
        return;
      }
      data.videoTopic = customTopicValue.trim();
    } else {
      if (!data.videoTopic || !data.videoTopic.trim()) {
        showNotification('Please select a video topic', 'error');
        return;
      }
    }

    console.log('AI Listing Form Data:', data);
    showNotification('Form submitted successfully!', 'success');
    // TODO: Implement actual form submission logic
  };

  return (
    <ProtectedRoute>
      <div className="bg-white">
        <div className="max-w-[1260px] mx-auto xl:px-0 px-3 lg:py-20 py-10">
          <div className="text-center mb-8">
            <h1 className="text-[37px] md:text-4xl leading-[40px] lg:text-[42px] font-semibold text-[#171717] mb-4">
              Create Videos Effortlessly
            </h1>
            <p className="text-lg md:text-[20px] text-[#5F5F5F] max-w-3xl mx-auto leading-[24px]">
              Custom AI videos for agents & loan officers—just fill one form, <br className="hidden md:block" /> hit submit, and we handle the rest.
            </p>
          </div>

          <div className="flex justify-center mb-10">
            <Link
              href="/create-video"
              className="inline-flex items-center md:max-w-[167px] max-w-full w-full justify-center gap-2 px-6 py-[9.4px] bg-transparent text-[#5046E5] rounded-full md:text-[20px] text-[18px] hover:bg-[#5046E5] hover:text-white border-2 border-[#5046E5] transition-all duration-300 font-semibold whitespace-nowrap"
            >
              Gallery
            </Link>
          </div>

          <form onSubmit={handleSubmit(onSubmit, (errors) => {
            setSubmitAttempted(true);
            if (Object.keys(errors).length > 0) {
              setFormManuallyTouched(true);
              const firstError = Object.values(errors)[0];
              if (firstError && 'message' in firstError) {
                const errorMessage = firstError.message as string || 'Please fix form errors';
                showNotification(errorMessage, 'error');
              }
            }
          })} className="space-y-7">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-[16px] font-normal text-[#5F5F5F] mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <FormInput
                  field="name"
                  placeholder="e.g. John Smith"
                  type="text"
                  autoComplete="name"
                  register={register}
                  errors={formManuallyTouched || submitAttempted ? errors : {}}
                  disabled={false}
                />
              </div>

              <div className="avatar-dropdown-button">
                <label className="block text-[16px] font-normal text-[#5F5F5F] mb-1">
                  Avatar <span className="text-red-500">*</span>
                </label>
                <FormDropdown
                  field="avatar"
                  options={avatarOptions}
                  placeholder="Select Option"
                  currentValue={watch('avatar') || ''}
                  isOpen={openDropdown === 'avatar'}
                  hasError={errors.avatar}
                  register={register}
                  errors={errors}
                  onToggle={handleDropdownToggle}
                  onSelect={handleDropdownSelect}
                  onBlur={() => {}}
                  isAvatarField={true}
                  isFromDefaultAvatar={isFromDefaultAvatar}
                  extendedAvatarOptions={extendedAvatarOptions}
                  avatars={avatars}
                  avatarsLoading={avatarsLoading}
                  avatarsError={avatarsError}
                  selectedAvatars={selectedAvatars}
                  onFetchAvatars={fetchAvatars}
                  onAvatarClick={handleAvatarClick}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleAvatarDragOver}
                  onDragLeave={handleAvatarDragLeave}
                  onDrop={handleAvatarDrop}
                  onRemoveAvatar={handleRemoveAvatar}
                  onClearAllAvatars={handleClearAllAvatars}
                  isAvatarSelected={isAvatarSelected}
                  isAvatarTypeAllowed={isAvatarTypeAllowed}
                  isAvatarPending={isAvatarPending}
                  getAvatarSelectionNumber={getAvatarSelectionNumber}
                  getAvatarType={getAvatarType}
                  isSingleSelection={true}
                />
              </div>

              <div ref={languageDropdownRef}>
                <label className="block text-[16px] font-normal text-[#5F5F5F] mb-1">
                  Language <span className="text-red-500">*</span>
                </label>
                {renderDropdown('language', languageOptions, 'Select Language', languageDropdownRef)}
              </div>

              <div ref={cityDropdownRef}>
                <label className="block text-[16px] font-normal text-[#5F5F5F] mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <FormInput
                  field="city"
                  placeholder="e.g. Los Angeles"
                  type="text"
                  autoComplete="address-level2"
                  register={register}
                  errors={formManuallyTouched || submitAttempted ? errors : {}}
                  disabled={false}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-[16px] font-normal text-[#5F5F5F] mb-1">
                  Video Topic <span className="text-red-500">*</span>
                </label>
                {renderTrendsDropdown('videoTopic', 'Select a trend')}
              </div>

              {showCustomTopicInput && (
                <div>
                  <label className="block text-[16px] font-normal text-[#5F5F5F] mb-1">
                    Custom Topic <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customTopicValue}
                    onChange={handleCustomTopicChange}
                    onBlur={handleCustomTopicBlur}
                    placeholder="Enter your custom topic"
                    className={`w-full px-4 py-[10.5px] text-[18px] font-normal bg-[#EEEEEE] hover:bg-[#F5F5F5] border-0 rounded-[8px] text-left transition-all duration-300 focus:outline-none focus:ring focus:ring-[#5046E5] focus:bg-white text-gray-800 ${!customTopicValue.trim() && formManuallyTouched ? 'ring-2 ring-red-500' : ''}`}
                  />
                  {!customTopicValue.trim() && formManuallyTouched && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1" role="alert">
                      <AlertCircle className="w-4 h-4" />
                      Please enter a custom topic
                    </p>
                  )}
                  {keyPointsError && showCustomTopicInput && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1" role="alert">
                      <AlertCircle className="w-4 h-4" />
                      {keyPointsError.length > 50 ? `${keyPointsError.substring(0, 50)}...` : keyPointsError}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-center pt-4">
              <button
                type="submit"
                className="w-full max-w-md px-6 py-3 bg-[#5046E5] text-white rounded-full font-semibold text-lg hover:bg-[#4338CA] transition-colors duration-300"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}

