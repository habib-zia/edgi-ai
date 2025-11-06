'use client'

import React from 'react'

interface EmptyStateProps {
  searchQuery: string
}

export default function EmptyState({ searchQuery }: EmptyStateProps) {
  return (
    <div className="col-span-full text-center py-12">
      <p className="text-gray-500 text-lg">
        {searchQuery ? 'No videos found matching your search.' : 'No videos available.'}
      </p>
    </div>
  )
}

