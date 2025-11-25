"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAVIGATION_ITEMS_MOBILE, BRAND_NAME, ANIMATIONS } from "@/lib/constants";
import { cn, handleAnchorClick } from "@/lib/utils";
import { useAnalytics } from "@/hooks/use-analytics";
import { useActiveSection } from "@/hooks/use-active-section";
import SignupModal from "@/components/ui/signup-modal";
import SigninModal from "@/components/ui/signin-modal";
import ForgotPasswordModal from "@/components/ui/forgot-password-modal";
import EmailVerificationModal from "@/components/ui/email-verification-modal";

import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { clearUser } from "@/store/slices/userSlice";
import { useRouter } from "next/navigation";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// Focus trap hook for accessibility
function useFocusTrap(isActive: boolean) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const previousActiveElement = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (!isActive || !containerRef.current) return;

    // Store the currently focused element
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Focus the first focusable element in the sidebar
    const focusableElements = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus();
    }

    // Handle tab key for focus trap
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;

      const focusableElements = Array.from(
        containerRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) || []
      ) as HTMLElement[];

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      // Restore focus when closing
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isActive]);

  return containerRef;
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const pathname = usePathname();
  const containerRef = useFocusTrap(isOpen);
  const { trackNavigation, trackButtonClick } = useAnalytics();
  const [isSignupModalOpen, setIsSignupModalOpen] = React.useState(false);
  const [isSigninModalOpen, setIsSigninModalOpen] = React.useState(false);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = React.useState(false);
  const [isEmailVerificationModalOpen, setIsEmailVerificationModalOpen] = React.useState(false);
  const [verificationEmail, setVerificationEmail] = React.useState('');
  const { isAuthenticated, user: currentUser, isLoading } = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const router = useRouter();
  
  // Track active section based on scroll position (only on home page)
  const sectionIds = ['getting-started', 'how-it-works', 'benefits', 'pricing', 'faq', 'contact'];
  const activeSection = useActiveSection(sectionIds);
  
  // Check if we're on the home page
  const isHomePage = pathname === '/';
  
  // Close sidebar when clicking outside
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
        trackButtonClick("mobile_menu", "sidebar", "close_escape");
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose, trackButtonClick]);

  return (
    <>
      {/* Backdrop with enhanced blur */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/60 backdrop-blur-md transition-all duration-500 ease-out lg:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar Container */}
      <div
        ref={containerRef}
        id="mobile-sidebar"
        style={{borderTopLeftRadius: "25px", borderBottomLeftRadius: "25px"}}
        className={cn(
          "overflow-hidden fixed top-0 right-0 z-50 h-full w-full max-w-sm bg-gradient-to-b from-white via-gray-50/95 to-white/98 backdrop-blur-2xl border-l border-gray-200/30 shadow-2xl transition-all duration-500 ease-out lg:hidden flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation menu"
      >
        {/* Header Section */}
        <div className="relative p-8 bg-gradient-to-r from-blue-50/80 via-purple-50/60 to-blue-50/80 border-b border-gray-200/40 flex-shrink-0">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 via-transparent to-purple-100/20" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)]" />
          
          <div className="relative flex items-center justify-between">
            <Link 
              href="#home" 
              className="group flex items-center space-x-3  rounded-lg p-1 text-[#5046E5] text-2xl font-bold"
              onClick={(e) => {
                if (handleAnchorClick("#home", onClose)) {
                  e.preventDefault();
                  trackNavigation(pathname, "#home", "click");
                } else {
                  onClose();
                  trackNavigation(pathname, "/", "click");
                }
              }}
              aria-label={`${BRAND_NAME} - Go to homepage`}
            >
              EdgeAI<span className="text-[#E54B46] font-bold">Realty</span>
              
            </Link>
            
            <button
              onClick={() => {
                onClose();
                trackButtonClick("mobile_menu", "sidebar", "close_button");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onClose();
                  trackButtonClick("mobile_menu", "sidebar", "close_button");
                }
              }}
              className="group relative p-3 rounded-xl bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-300 border border-gray-200/50 cursor-pointer focus:outline-none"
              aria-label="Close mobile menu"
              type="button"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <svg
                className="relative w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-colors duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation Section - Scrollable */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <nav className="p-6 space-y-2" role="navigation" aria-label="Main navigation">
            <div className="mb-6">
              <div className="text-xs font-semibold text-[#5F5F5F] uppercase tracking-wider mb-4 px-2">
                Navigation
              </div>
              
              {/* Home Page Navigation Items */}
              {NAVIGATION_ITEMS_MOBILE.filter(item => {
                if ((item.label === "Report Analytics" || item.label === "Schedule Post") && !isAuthenticated) {
                  return false;
                }
                return true;
              }).map((item, index) => {
                const sectionId = item.href.substring(1); // Remove the # from href
                const isActive = isHomePage && activeSection === sectionId;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                      "group relative flex items-center px-4 py-4 text-base font-medium rounded-2xl transition-all duration-500 ease-out overflow-hidden focus:outline-none",
                      isActive
                        ? "bg-gradient-to-r from-[#5046E5] to-[#3A2DFD] text-white"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-100/90"
                    )}
                    onClick={(e) => {
                      if (isHomePage) {
                        // If we're on home page, handle smooth scrolling for anchor links
                        if (item.href.startsWith('#')) {
                          if (handleAnchorClick(item.href, onClose)) {
                            e.preventDefault();
                            trackNavigation(pathname, item.href, "click");
                          }
                        } else {
                          // For non-anchor links on home page, navigate normally
                          e.preventDefault();
                          onClose();
                          trackNavigation(pathname, item.href, "click");
                          router.push(item.href);
                        }
                      } else {
                        // If we're on a different page
                        e.preventDefault();
                        onClose();
                        
                        if (item.href.startsWith('#')) {
                          // For anchor links, navigate to home page with hash
                          // The home page will handle smooth scrolling via useEffect
                          const homeUrl = `/${item.href}`;
                          trackNavigation(pathname, homeUrl, "click");
                          router.push(homeUrl);
                        } else {
                          // For page links, navigate directly
                          trackNavigation(pathname, item.href, "click");
                          router.push(item.href);
                        }
                      }
                    }}
                    aria-current={isActive ? "page" : undefined}
                    aria-label={`${item.label}${isActive ? " (current page)" : ""}`}
                    style={{
                      animationDelay: `${Math.min(index * ANIMATIONS.staggerDelay, ANIMATIONS.maxStaggerDelay)}ms`
                    }}
                  >
                    {/* Background Effects */}
                    <div className={cn(
                      "absolute inset-0 transition-all duration-500 ease-out",
                      isActive
                        ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20"
                        : "bg-gradient-to-r from-gray-100/0 to-gray-100/0 group-hover:from-gray-100/50 group-hover:to-gray-100/30"
                    )} />
                    
                    {/* Active Indicator */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full shadow-lg" />
                    )}
                    
                    {/* Icon Placeholder */}
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center mr-4 transition-all duration-300",
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600"
                    )}>
                      <div className="w-2 h-2 bg-current rounded-full" />
                    </div>
                    
                    <span className="relative z-10 font-medium">
                      {item.label}
                    </span>
                    
                    {/* Hover Animation */}
                    <div className={cn(
                      "absolute right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0",
                      isActive ? "text-white" : "text-gray-400"
                    )}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                );
              })}


              {/* Account Navigation Items - Only show when logged in */}
              {isAuthenticated && (
                <>
                  <Link
                    href="/account"
                    onClick={() => {
                      onClose();
                      trackNavigation(pathname, "/account", "click");
                    }}
                    className={cn(
                      "group relative flex items-center px-4 py-4 text-base font-medium rounded-2xl transition-all duration-500 ease-out overflow-hidden focus:outline-none",
                      pathname === "/account"
                        ? "bg-gradient-to-r from-[#5046E5] to-[#3A2DFD] text-white"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-100/90"
                    )}
                    aria-current={pathname === "/account" ? "page" : undefined}
                    aria-label={`Account${pathname === "/account" ? " (current page)" : ""}`}
                  >
                    {/* Background Effects */}
                    <div className={cn(
                      "absolute inset-0 transition-all duration-500 ease-out",
                      pathname === "/account"
                        ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20"
                        : "bg-gradient-to-r from-gray-100/0 to-gray-100/0 group-hover:from-gray-100/50 group-hover:to-gray-100/30"
                    )} />
                    
                    {/* Active Indicator */}
                    {pathname === "/account" && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full shadow-lg" />
                    )}
                    
                    {/* Icon Placeholder */}
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center mr-4 transition-all duration-300",
                      pathname === "/account"
                        ? "bg-white/20 text-white"
                        : "bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600"
                    )}>
                      <div className="w-2 h-2 bg-current rounded-full" />
                    </div>
                    
                    <span className="relative z-10 font-medium">
                      Account
                    </span>
                    
                    {/* Hover Animation */}
                    <div className={cn(
                      "absolute right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0",
                      pathname === "/account" ? "text-white" : "text-gray-400"
                    )}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>

                  <Link
                    href="/create-video"
                    onClick={() => {
                      onClose();
                      trackNavigation(pathname, "/create-video", "click");
                    }}
                    className={cn(
                      "group relative flex items-center px-4 py-4 text-base font-medium rounded-2xl transition-all duration-500 ease-out overflow-hidden focus:outline-none",
                      pathname === "/create-video"
                        ? "bg-gradient-to-r from-[#5046E5] to-[#3A2DFD] text-white"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-100/90"
                    )}
                    aria-current={pathname === "/create-video" ? "page" : undefined}
                    aria-label={`My Videos${pathname === "/create-video" ? " (current page)" : ""}`}
                  >
                    {/* Background Effects */}
                    <div className={cn(
                      "absolute inset-0 transition-all duration-500 ease-out",
                      pathname === "/create-video"
                        ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20"
                        : "bg-gradient-to-r from-gray-100/0 to-gray-100/0 group-hover:from-gray-100/50 group-hover:to-gray-100/30"
                    )} />
                    
                    {/* Active Indicator */}
                    {pathname === "/create-video" && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full shadow-lg" />
                    )}
                    
                    {/* Icon Placeholder */}
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center mr-4 transition-all duration-300",
                      pathname === "/create-video"
                        ? "bg-white/20 text-white"
                        : "bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600"
                    )}>
                      <div className="w-2 h-2 bg-current rounded-full" />
                    </div>
                    
                    <span className="relative z-10 font-medium">
                      My Videos
                    </span>
                    
                    {/* Hover Animation */}
                    <div className={cn(
                      "absolute right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0",
                      pathname === "/create-video" ? "text-white" : "text-gray-400"
                    )}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>

        {/* Action Buttons Section - Fixed at Bottom */}
        <div className="flex-shrink-0 p-6 border-t border-gray-200/50 bg-gradient-to-t from-gray-50/80 to-transparent">
          <div className="space-y-4">
            {isLoading ? (
              // Show loading skeleton during authentication check
              <div className="space-y-4">
                <div className="px-2">
                  <div className="text-xs font-semibold text-[#5F5F5F] uppercase tracking-wider mb-2">
                    Loading...
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-1 h-12 bg-gray-200 rounded-2xl animate-pulse"></div>
                  <div className="flex-1 h-12 bg-gray-200 rounded-2xl animate-pulse"></div>
                </div>
              </div>
            ) : isAuthenticated ? (
              <div className="space-y-4">
                {/* User Info */}
                <div className="px-2">
                  <div className="text-xs font-semibold text-[#5F5F5F] uppercase tracking-wider mb-2">
                    Signed in as
                  </div>
                  <div className="text-sm font-medium text-gray-700">
                    {currentUser?.firstName} {currentUser?.lastName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {currentUser?.email}
                  </div>
                </div>
                
                {/* Logout Button */}
                <button
                  onClick={() => {
                    dispatch(clearUser());
                    onClose();
                    trackButtonClick("logout", "mobile_sidebar", "logout");
                    // Redirect to home page after logout
                    router.push('/');
                  }}
                  className="w-full inline-flex items-center justify-center px-6 py-4 text-base font-medium text-red-600 border-2 border-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all duration-300 focus:outline-none"
                  aria-label="Log out of your account"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-xs font-semibold text-[#5F5F5F] uppercase tracking-wider mb-4 px-2">
                  Account
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      onClose();
                      setIsSigninModalOpen(true);
                      trackButtonClick("login", "mobile_sidebar", "open_modal");
                    }}
                    className="flex-1 inline-flex items-center justify-center px-6 py-4 text-base font-medium text-[#5046E5] border-2 border-[#5046E5] rounded-2xl hover:bg-[#5046E5] hover:text-white transition-all duration-300 focus:outline-none"
                    aria-label="Log in to your account"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      setIsSignupModalOpen(true);
                      trackButtonClick("register", "mobile_sidebar", "open_modal");
                    }}
                    className="flex-1 inline-flex items-center justify-center px-6 py-4 text-base font-medium bg-gradient-to-r from-[#5046E5] to-[#3A2DFD] text-white rounded-2xl hover:from-[#3A2DFD] hover:to-[#5046E5] transition-all duration-300 shadow-sm hover:shadow-md focus:outline-none"
                    aria-label="Create a new account"
                  >
                    Sign Up
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Signup Modal */}
      <SignupModal
        isOpen={isSignupModalOpen}
        onClose={() => setIsSignupModalOpen(false)}
        onOpenSignin={() => setIsSigninModalOpen(true)}
        onRegistrationSuccess={(email) => {
          setVerificationEmail(email);
          setIsEmailVerificationModalOpen(true);
        }}
      />

      {/* Email Verification Modal */}
      <EmailVerificationModal
        isOpen={isEmailVerificationModalOpen}
        onClose={() => setIsEmailVerificationModalOpen(false)}
        email={verificationEmail}
      />

      {/* Signin Modal */}
      <SigninModal
        isOpen={isSigninModalOpen}
        onClose={() => setIsSigninModalOpen(false)}
        onOpenSignup={() => setIsSignupModalOpen(true)}
        onOpenForgotPassword={() => setIsForgotPasswordModalOpen(true)}
      />

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotPasswordModalOpen}
        onClose={() => setIsForgotPasswordModalOpen(false)}
        onOpenSignin={() => setIsSigninModalOpen(true)}
      />
    </>
  );
}
