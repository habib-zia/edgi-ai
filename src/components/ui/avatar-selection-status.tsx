'use client'

import React from 'react'
import { CheckCircle, AlertCircle } from 'lucide-react'
import { Avatar } from '@/lib/api-service'

interface AvatarSelectionStatusProps {
  selectedAvatars: {
    title: Avatar | null
    body: Avatar | null
    conclusion: Avatar | null
  }
}

export default function AvatarSelectionStatus({ selectedAvatars }: AvatarSelectionStatusProps) {
  const totalSelected = [selectedAvatars.title, selectedAvatars.body, selectedAvatars.conclusion].filter(Boolean).length
  const isComplete = selectedAvatars.title && selectedAvatars.body && selectedAvatars.conclusion

  return (
    <>
      {/* Success Status - Show when avatars are selected */}
      {totalSelected > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-blue-800 font-semibold">Avatar Selection</h3>
              <p className="text-blue-700 text-sm">
                {totalSelected} of 3 avatars selected
                {totalSelected < 3 && (
                  <span className="block text-xs text-blue-600 mt-1">
                    Select {3 - totalSelected} more avatar{3 - totalSelected > 1 ? 's' : ''} to continue
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Warning Status - Show when assignment is incomplete */}
      {!isComplete && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <div>
              <h3 className="text-yellow-800 font-semibold">Avatar Assignment Required</h3>
              <p className="text-yellow-700 text-sm">
                Please assign selected avatars to: 
                {!selectedAvatars.title && <span className="font-semibold"> Title,</span>}
                {!selectedAvatars.body && <span className="font-semibold"> Body <span className="font-normal">and</span></span>}
                {!selectedAvatars.conclusion && <span className="font-semibold"> Conclusion</span>}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
