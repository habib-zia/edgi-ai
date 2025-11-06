'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { NAVIGATION_ITEMS_MOBILE } from '@/lib/constants'
import { useActiveSection } from '@/hooks/use-active-section'
import MobileNavigationItem from './MobileNavigationItem'

interface MobileSidebarNavigationProps {
  isAuthenticated: boolean
  onClose: () => void
  onTrackNavigation: (from: string, to: string, method?: 'click' | 'keyboard' | 'programmatic') => void
}

export default function MobileSidebarNavigation({
  isAuthenticated,
  onClose,
  onTrackNavigation
}: MobileSidebarNavigationProps) {
  const pathname = usePathname()
  const sectionIds = ['getting-started', 'how-it-works', 'benefits', 'pricing', 'faq', 'contact']
  const activeSection = useActiveSection(sectionIds)
  const isHomePage = pathname === '/'

  const filteredItems = NAVIGATION_ITEMS_MOBILE.filter(item => {
    // Hide Report Analytics if user is not authenticated
    if (item.label === 'Report Analytics' && !isAuthenticated) {
      return false
    }
    return true
  })

  return (
    <div className="flex-1 overflow-y-auto min-h-0">
      <nav className="p-6 space-y-2" role="navigation" aria-label="Main navigation">
        <div className="mb-6">
          <div className="text-xs font-semibold text-[#5F5F5F] uppercase tracking-wider mb-4 px-2">
            Navigation
          </div>
          
          {/* Home Page Navigation Items */}
          {filteredItems.map((item, index) => {
            const sectionId = item.href.substring(1) // Remove the # from href
            const isActive = isHomePage && activeSection === sectionId
            return (
              <MobileNavigationItem
                key={item.label}
                item={item}
                index={index}
                isActive={isActive}
                isHomePage={isHomePage}
                pathname={pathname}
                onClose={onClose}
                onTrackNavigation={onTrackNavigation}
              />
            )
          })}
        </div>
      </nav>
    </div>
  )
}

