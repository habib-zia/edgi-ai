import React from 'react'
import { X, Trash2 } from 'lucide-react'
import { useModalScrollLock } from '@/hooks/useModalScrollLock'

interface ScheduleDeleteModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
}

export default function ScheduleDeleteModal({ isOpen, onClose, onConfirm }: ScheduleDeleteModalProps) {
    useModalScrollLock(isOpen)

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-xl w-full mx-4 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-black hover:text-gray-600 transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="text-center">
                    <div className="w-16 h-16 bg-[#E54B46] rounded-full flex items-center justify-center mx-auto mb-4 mt-15">
                        <Trash2 className="w-8 h-8 text-white" />
                    </div>

                    <h2 className="text-xl font-semibold text-red-500 mb-4">Schedule Delete</h2>

                    <div className="text-[#282828] mb-8 space-y-1">
                        <p>Your Schedule will be deleted for set dated,</p>
                        <p>You have to rescheduled the posts</p>
                    </div>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="w-full px-4 py-2 bg-[#E54B46] text-white rounded-full font-semibold text-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#5046E5]/20 flex items-center justify-center cursor-pointer">
                        Cancel Schedule
                    </button>
                </div>
            </div>
        </div>
    )
}
