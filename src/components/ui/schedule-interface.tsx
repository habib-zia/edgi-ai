import React, { useState } from 'react'
import { Clock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import ScheduleDeleteModal from './schedule-delete-modal'
import { useSchedule } from '@/hooks/useSchedule'

interface ScheduleInterfaceProps {
  onStartScheduling: () => void
  autoScheduleData: any
  onScheduleDeleted?: () => void
}

interface ScheduleItemProps {
  label: string
  value: string
  hasIcon?: boolean
}

const ScheduleItem: React.FC<ScheduleItemProps> = ({ label, value, hasIcon = false }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return dateString

    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch (error) {
      return dateString
    }
  }

  const getDisplayValue = () => {
    if (label === 'Start Date' || label === 'End Date') {
      return formatDate(value)
    } else if (label === 'Day' && Array.isArray(value)) {
      return value.join(', ')
    }
    return value
  }

  const displayValue = getDisplayValue()

  return (
    <div>
      <div className="flex flex-col gap-2 ">
        <span className="text-gray-500 text-sm">{label}</span>
        <span className="text-gray-800 font-medium">{displayValue}</span>
      </div>
    </div>
  )
}

export default function ScheduleInterface({ onStartScheduling, autoScheduleData, onScheduleDeleted }: ScheduleInterfaceProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const { deleteSchedule } = useSchedule()
  const router = useRouter()

  const handleDeleteClick = () => {
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    try {
      const scheduleId = autoScheduleData?.id
      const success = await deleteSchedule(scheduleId)
      
      if (success) {
        // Call the callback to refresh schedule data
        if (onScheduleDeleted) {
          onScheduleDeleted()
        }
      }
    } catch (error) {
      console.error('Error in handleDeleteConfirm:', error)
    } finally {
      setShowDeleteModal(false)
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteModal(false)
  }

  const handleReviewAndUpdate = () => {
    router.push('/scheduled-post')
  }
  if (autoScheduleData) {
    return (
      <>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-center">
            <div className="w-20 h-20 bg-[#5046E5] rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-8">Your Schedule Posts</h3>

            <div className="bg-gray-100 rounded-lg p-6 mb-6 w-full max-w-[666px] lg:w-[666px] xl:w-[666px] mx-auto">
              <div className="grid grid-cols-2 gap-8 justify-between">
                <div className="space-y-4 text-start">
                  <ScheduleItem
                    label="Frequency"
                    value={autoScheduleData.scheduleInfo?.frequency || 'Twice a Week'}
                    hasIcon={true}
                  />
                  <ScheduleItem
                    label="Day"
                    value={autoScheduleData.scheduleInfo?.days || autoScheduleData.days || 'Monday, Tuesday'}
                    hasIcon={true}
                  />
                </div>

                <div className="space-y-4 text-right">
                  <ScheduleItem
                    label="Start Date"
                    value={autoScheduleData?.scheduleInfo.startDate || 'Sep 15, 2025'}
                  />
                  <ScheduleItem
                    label="End Date"
                    value={autoScheduleData?.scheduleInfo?.endDate || 'Oct 15, 2025'}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleReviewAndUpdate}
                className="w-full mt-6 px-4 py-2 bg-white border border-[#5046E5] text-[#5046E5] rounded-full font-medium hover:bg-[#5046E5] hover:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#5046E5]/20"
              >
                Review & Update
              </button>
            </div>
            <button
              type="button"
              onClick={handleDeleteClick}
              className="w-full px-4 py-2 bg-[#5046E5] text-white rounded-full font-semibold text-lg hover:bg-[#4338CA] transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#5046E5]/20 flex items-center justify-center cursor-pointer">
              Cancel Schedule
            </button>
          </div>
        </div>

        <ScheduleDeleteModal
          isOpen={showDeleteModal}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
        />
      </>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="text-center">
        <div className="w-20 h-20 bg-[#5046E5] rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Schedule Your Posts</h3>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Create and schedule your social media posts to be published automatically at your preferred times.
        </p>
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onStartScheduling}
            className="px-8 py-4 bg-[#5046E5] text-white rounded-full font-semibold text-lg hover:bg-[#4338CA] transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#5046E5]/20 flex items-center justify-center gap-3 cursor-pointer"
          >
            <Clock className="w-5 h-5" />
            Start Scheduling
          </button>
        </div>
      </div>
    </div>
  )
}
