'use client'

import { useState, useRef, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { clearUser, setLoading } from '@/store/slices/userSlice'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { apiService } from '@/lib/api-service'

interface ProfileDropdownProps {
  isMobile?: boolean
  onClose?: () => void
}

export default function ProfileDropdown({ isMobile = false, onClose }: ProfileDropdownProps) {
  const { user: currentUser } = useAppSelector((state) => state.user)
  const dispatch = useAppDispatch()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      )
      {
        setIsOpen(false)
      }
    }

    if (isOpen)
    {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen)
      {
        setIsOpen(false)
        buttonRef.current?.focus()
      }
    }

    if (isOpen)
    {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const handleLogout = async () => {
    try
    {
      // Set loading state to show loader during logout
      dispatch(setLoading(true))

      // Close dropdown first
      setIsOpen(false)
      if (onClose) onClose()

      // Call logout API to invalidate token on server
      try
      {
        await apiService.logout()
      } catch (error)
      {
        // Log error but don't prevent logout from proceeding
        // API logout failed, but we'll still clear local data
      }

      // Clear user data from Redux store
      dispatch(clearUser())

      // Redirect to home page
      router.push('/')
    } catch (error)
    {
      // Even if API call fails, clear local data
      dispatch(clearUser())
      router.push('/')
    } finally
    {
      // Set loading to false after a short delay to ensure smooth transition
      setTimeout(() => {
        dispatch(setLoading(false))
      }, 500)
    }
  }

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  if (!currentUser) return null

  // Show loading state if user data is still being fetched
  if (currentUser.id === 'temp' || currentUser.firstName === 'Loading...')
  {
    return (
      <div className={cn(
        "flex items-center space-x-2 px-3 py-2 rounded-full",
        isMobile ? "w-full justify-center" : ""
      )}>
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
        {isMobile && (
          <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
        )}
      </div>
    )
  }

  const menuItems = [
    {
      label: 'Account',
      href: '/account',
      isLogout: false
    },
    {
      label: 'My Videos',
      href: '/create-video',
      isLogout: false
    },
    {
      label: 'Report Analytics',
      href: '/report-analytics',
      isLogout: false
    },
    {
      label: 'Logout',
      href: '#',
      isLogout: true
    }
  ]

  return (
    <div className={cn("relative", isMobile ? "w-full" : "")}>
      {/* Profile Button */}
      <button
        ref={buttonRef}
        onClick={toggleDropdown}
        className={cn(
          "flex items-center justify-center w-[200px] cursor-pointer gap-2 px-2 py-[7.4px] rounded-full border-2 border-[#5F5F5F] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5046E5] focus-visible:ring-offset-2",
          isMobile
            ? "w-full justify-between bg-gray-100 hover:bg-gray-200 px-4 py-3"
            : "hover:bg-gray-100 border-2 border-[#5F5F5F] hover:border-gray-300"
        )}
        aria-label={`Profile menu for ${currentUser.firstName} ${currentUser.lastName}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >

        {/* Name (desktop) or full info (mobile) */}
        <div className={cn("flex items-center gap-x-3", isMobile ? "flex-1" : "")}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 12C10.9 12 9.95833 11.6083 9.175 10.825C8.39167 10.0417 8 9.1 8 8C8 6.9 8.39167 5.95833 9.175 5.175C9.95833 4.39167 10.9 4 12 4C13.1 4 14.0417 4.39167 14.825 5.175C15.6083 5.95833 16 6.9 16 8C16 9.1 15.6083 10.0417 14.825 10.825C14.0417 11.6083 13.1 12 12 12ZM4 20V17.2C4 16.6333 4.146 16.1127 4.438 15.638C4.73 15.1633 5.11733 14.8007 5.6 14.55C6.63333 14.0333 7.68333 13.646 8.75 13.388C9.81667 13.13 10.9 13.0007 12 13C13.1 12.9993 14.1833 13.1287 15.25 13.388C16.3167 13.6473 17.3667 14.0347 18.4 14.55C18.8833 14.8 19.271 15.1627 19.563 15.638C19.855 16.1133 20.0007 16.634 20 17.2V20H4Z" fill="#5F5F5F" />
          </svg>
          <span className={cn(
            "font-medium text-[#5F5F5F]",
            isMobile ? "text-[20px]" : "text-[20px]"
          )}>
            {isMobile
              ? `${currentUser.firstName} ${currentUser.lastName}`
              : currentUser.firstName
            }
          </span>
          <svg width="18" height="9" className={cn(
            "transition-transform duration-200",
            isOpen ? "rotate-180" : ""
          )} viewBox="0 0 18 9" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0L9 9L18 0H0Z" fill="#5F5F5F" />
          </svg>

        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className={cn(
            "absolute z-[9999] bg-white rounded-[12px] shadow-xl border border-gray-200 p-2 min-w-[200px]",
            isMobile
              ? "top-full left-0 right-0 mt-2"
              : "top-full right-0 mt-2"
          )}
          role="menu"
          aria-label="Profile menu"
          style={{
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}
        >

          {/* Menu Items */}
          <div className="">
            {menuItems.map((item) => {
              if (item.isLogout)
              {
                // Render logout as a button styled as a link with border above
                return (
                  <div key={item.label}>
                    <div className="border-b border-[#A0A3BD] mx-2 my-2"></div>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        handleLogout()
                      }}
                      className={cn(
                        "w-full flex items-center cursor-pointer gap-3 rounded-[8px] px-4 py-3 text-[16px] font-medium transition-colors duration-150 focus:outline-none focus:bg-gray-100 text-left",
                        "text-[#374151] hover:bg-gray-100 hover:text-[#111827]"
                      )}
                      role="menuitem"
                    >
                      <span>{item.label}</span>
                    </button>
                  </div>
                )
              }

              // Render navigation items as Links
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => {
                    setIsOpen(false)
                    if (onClose) onClose()
                    // window.location.href = item.href
                  }}
                  className={cn(
                    "w-full flex items-center cursor-pointer gap-3 rounded-[8px] px-4 py-3 text-[16px] font-medium transition-colors duration-150 focus:outline-none focus:bg-gray-100",
                    "text-[#374151] hover:bg-gray-100 hover:text-[#111827]"
                  )}
                  role="menuitem"
                >
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
