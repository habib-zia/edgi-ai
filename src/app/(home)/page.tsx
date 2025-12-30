"use client";

import Link from "next/link";
import { useEffect, Suspense, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { IoMdArrowDropdown } from "react-icons/io";
import { FaMusic, FaVideo } from "react-icons/fa";
import { SLIDER_ITEMS, REVIEW_SLIDER_ITEMS } from "@/lib/constants";
import { Slider } from "@/components/ui/slider";
import VideoCard from "@/components/ui/video-card";
import Image from "next/image";
import Partners from "@/components/ui/partners";
import ActionCard from "@/components/ui/action-card";
import { ContactForm, EmailVerificationModal, FeaturesSection } from "@/components/ui";
import FAQSection from "@/components/ui/FAQsection";
import { ReviewSlider } from "@/components/ui/review-slider";
import { ProcessSteps } from "@/components/ui/process-steps";
import PricingSection from "@/components/ui/pricing-section";

import { smoothScrollTo } from "@/lib/utils";
import SigninModal from "@/components/ui/signin-modal";
import { useState } from "react";
import { useAppSelector } from "@/store/hooks";
import { useNotificationStore } from "@/components/ui/global-notification";
import { apiService } from "@/lib/api-service";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useSubscription } from "@/hooks/useSubscription";
import AvatarCreationModal from "@/components/ui/avatar-creation/AvatarCreationModal";
import SignupModal from "@/components/ui/signup-modal";
import ForgotPasswordModal from "@/components/ui/forgot-password-modal";
import PendingPaymentToast from "@/components/ui/pending-payment-toast";
import SubscriptionRequiredToast from "@/components/ui/subscription-required-toast";
import { useUnifiedSocketContext } from "@/components/providers/UnifiedSocketProvider";

function HomePageContent() {
  const [isSigninModalOpen, setIsSigninModalOpen] = useState(false);
  const [hasPosts, setHasPosts] = useState(false);
  const [, setPostsLoading] = useState(false);
  const { isAuthenticated } = useAppSelector((state) => state.user);
  const searchParams = useSearchParams();
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  // Modal states
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);
  const [isEmailVerificationModalOpen, setIsEmailVerificationModalOpen] = useState(false);
  const [verificationEmail] = useState('');
  
  // Pending payment toast state
  const [showPendingPaymentToast, setShowPendingPaymentToast] = useState(false);
  const [pendingPaymentMessage, setPendingPaymentMessage] = useState('');
  const [paymentContext, setPaymentContext] = useState<'video' | 'avatar'>('video');
  
  // Subscription required toast state
  const [showSubscriptionRequiredToast, setShowSubscriptionRequiredToast] = useState(false);
  const [subscriptionRequiredMessage, setSubscriptionRequiredMessage] = useState('');
  const [subscriptionContext, setSubscriptionContext] = useState<'video' | 'avatar'>('video');
  
  const { user } = useSelector((state: RootState) => state.user);
  const { showNotification } = useNotificationStore();
  const { checkVideoUsageLimit } = useSubscription();
  const { isAvatarProcessing, isVideoAvatarProcessing } = useUnifiedSocketContext();
  const isAnyAvatarProcessing = isAvatarProcessing || isVideoAvatarProcessing;
  
  // Video Tour dropdown state
  const [isVideoTourDropdownOpen, setIsVideoTourDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const videoTourDropdownRef = useRef<HTMLDivElement>(null);
  const videoTourButtonRef = useRef<HTMLButtonElement>(null);


    // Modal handler functions
    const handleCloseSigninModal = () => {  
      setIsSigninModalOpen(false);
    };
  
    const handleOpenForgotPasswordModal = () => {
      setIsSigninModalOpen(false);
      setIsForgotPasswordModalOpen(true);
    };

  useEffect(() => {
    const hash = window.location.hash;
    if (hash)
    {
      setTimeout(() => {
        const elementId = hash.substring(1);
        smoothScrollTo(elementId);
      }, 300);
    }
  }, []);

  useEffect(() => {
    const showLogin = searchParams.get('showLogin');
    if (showLogin === 'true')
    {
      setIsSigninModalOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const verified = searchParams.get('verified');
    if (verified === 'true')
    {
      console.log('Email verified successfully!');
    }
  }, [searchParams]);

  const checkForPosts = useCallback(async () => {
    if (isAuthenticated) {
      setPostsLoading(true);
      try {
        const response = await apiService.getPublishedPosts();
        if (response.success && response.data && response.data.posts) {
          setHasPosts(response.data.posts.length > 0);
        } else {
          setHasPosts(false);
        }
      } catch (error) {
        console.error('Error checking for posts:', error);
        setHasPosts(false);
      } finally {
        setPostsLoading(false);
      }
    } else {
      setHasPosts(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    checkForPosts();
  }, [checkForPosts]);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close Video Tour dropdown when clicking outside (for mobile)
  useEffect(() => {
    if (!isMobile) return; // Only handle click-outside on mobile
    
    const handleClickOutside = (event: MouseEvent) => {
      if (
        videoTourDropdownRef.current &&
        !videoTourDropdownRef.current.contains(event.target as Node) &&
        videoTourButtonRef.current &&
        !videoTourButtonRef.current.contains(event.target as Node)
      ) {
        setIsVideoTourDropdownOpen(false);
      }
    };

    if (isVideoTourDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isVideoTourDropdownOpen, isMobile]);

  // Handle escape key for Video Tour dropdown
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isVideoTourDropdownOpen) {
        setIsVideoTourDropdownOpen(false);
        videoTourButtonRef.current?.focus();
      }
    };

    if (isVideoTourDropdownOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isVideoTourDropdownOpen]);

  const handleGetStartedClick = (e: React.MouseEvent) => {
    if (isAuthenticated)
    {
      window.location.href = '/create-video';
    } else
    {
      e.preventDefault();
      smoothScrollTo('pricing');
    }
  };

  const handleCustomAvatarClick = async () => {
    if (isAnyAvatarProcessing) {
      showNotification('Please wait for your current avatar to finish processing', 'warning');
      return;
    }
    if (user?.id) {
      // Check payment status before allowing avatar creation
      try {
        const usageCheck = await checkVideoUsageLimit();
        
        if (!usageCheck.canCreateVideo) {
          // Check if it's a pending payment issue
          if (usageCheck.message?.includes('payment is still being processed')) {
            setPaymentContext('avatar');
            setPendingPaymentMessage(usageCheck.message);
            setShowPendingPaymentToast(true);
            return;
          } else if (usageCheck.message?.includes('No active subscription found') || usageCheck.message?.includes('Please subscribe')) {
            setSubscriptionContext('avatar');
            setSubscriptionRequiredMessage(usageCheck.message);
            setShowSubscriptionRequiredToast(true);
            return;
          } else {
            showNotification(usageCheck.message || 'Unable to create avatar', 'error');
            return;
          }
        }
        
        // Payment is active, proceed with avatar creation
        setIsAvatarModalOpen(true);
      } catch (error) {
        console.error('Failed to check subscription status:', error);
        showNotification('Unable to verify subscription status. Please try again.', 'error');
      }
    } else {
      // User is not logged in, show notification and open signup modal
      showNotification('Please log in to create a custom avatar', 'warning');
      setIsSigninModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen">
      <section data-aos="fade-up" className="relative pt-14 lg:pt-20 px-3" id="getting-started">
        <div className="max-w-[1440px] mx-auto pb-12 relative z-10">
          <div className="text-center">
            <h1 className="text-[36px] md:text-6xl lg:text-[72px] font-semibold text-gray-900 mb-5 lg:leading-[84px] md:leading-[72px] leading-[47px]">
              Real Estate Marketing?<br className="hidden md:block" /> <span className="text-[#5046E5]">Automated. Effortless.</span> <br className="hidden md:block" />One Click Away
            </h1>
            <p className="text-xl lg:text-[20px] text-[#5F5F5F] mb-10 max-w-[500px] mx-auto leading-[24px]">
              Custom AI videos for agents & loan officers<br className="hidden md:block" /> just fill one form,
              hit submit, and we handle the rest.
            </p>
            <div className="flex flex-col gap-4">
          {isAuthenticated ? (
            <>
              {/* Video creation buttons with red background - Centered top row */}
              <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center">
                <Link 
                  href="/create-video/talking-head"
                  className="inline-flex cursor-pointer items-center justify-center px-[26.5px] py-[13.2px] text-base font-semibold bg-[#e64a46] text-white rounded-full transition-all !duration-300 hover:bg-transparent hover:text-[#e64a46] border-2 border-[#e64a46]"
                >
                  Talking Head Video
                </Link>
                
                {/* Video Tour Dropdown */}
                <div 
                  className="relative z-[100]" 
                  ref={videoTourDropdownRef}
                  onMouseEnter={() => !isMobile && setIsVideoTourDropdownOpen(true)}
                  onMouseLeave={() => !isMobile && setIsVideoTourDropdownOpen(false)}
                >
                  <button
                    ref={videoTourButtonRef}
                    onClick={() => isMobile && setIsVideoTourDropdownOpen(!isVideoTourDropdownOpen)}
                    className="inline-flex cursor-pointer items-center justify-center gap-2 px-[26.5px] py-[13.2px] text-base font-semibold bg-[#e64a46] text-white rounded-full transition-all !duration-300 hover:bg-transparent hover:text-[#e64a46] border-2 border-[#e64a46] w-full"
                    aria-expanded={isVideoTourDropdownOpen}
                    aria-haspopup="true"
                  >
                    Video Tour
                    <IoMdArrowDropdown 
                      className={`w-5 h-5 transition-transform duration-300 ${isVideoTourDropdownOpen ? 'rotate-180' : ''}`} 
                    />
                  </button>
                  
                  {/* Creative Dropdown Menu */}
                  {isVideoTourDropdownOpen && (
                    <div 
                      className="absolute z-[9999] mt-0 left-0 sm:left-auto sm:-right-10 bg-white rounded-2xl border border-gray-100 w-full sm:w-auto overflow-hidden min-w-[240px]"
                      role="menu"
                      aria-label="Video Tour menu"
                      style={{
                        boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.15), 0 10px 20px -5px rgba(0, 0, 0, 0.1)',
                        zIndex: 9999
                      }}
                    >
                      {/* Decorative header */}
                      <div className="bg-gradient-to-r from-[#e64a46] to-[#5046E5] h-1"></div>
                      
                      <div className="p-3 space-y-1">
                        <Link 
                          href="/create-video/music-video"
                          onClick={() => setIsVideoTourDropdownOpen(false)}
                          className="group flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 hover:bg-gradient-to-r hover:from-[#e64a46]/5 hover:to-[#f87171]/5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#e64a46]/20"
                          role="menuitem"
                        >
                          <div className="text-[#111827] font-semibold text-base group-hover:text-[#e64a46] transition-colors">
                            Music Video
                          </div>
                        </Link>
                        
                        {/* Visual separator */}
                        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mx-4 my-2"></div>
                        
                        <Link 
                          href="/create-video/listing"
                          onClick={() => setIsVideoTourDropdownOpen(false)}
                          className="group flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 hover:bg-gradient-to-r hover:from-[#e64a46]/5 hover:to-[#f87171]/5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#e64a46]/20"
                          role="menuitem"
                        >
                          <div className="text-[#111827] font-semibold text-base group-hover:text-[#5046E5] transition-colors">
                            Video Listing
                          </div>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Four action buttons with purple background - Centered bottom row */}
              <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center">
                <button 
                  onClick={handleCustomAvatarClick}
                  disabled={isAnyAvatarProcessing}
                  className={`inline-flex items-center justify-center px-[26.5px] py-[13.2px] text-base font-semibold rounded-full transition-all !duration-300 border-2 ${
                    isAnyAvatarProcessing 
                      ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed' 
                      : 'bg-[#5046E5] text-white cursor-pointer hover:bg-transparent hover:text-[#5046E5] border-[#5046E5]'
                  }`}
                >
                  {isAnyAvatarProcessing ? 'Processing...' : 'Custom Avatar'}
                </button>
                <Link href="/create-video" className="inline-flex cursor-pointer items-center justify-center px-[26.5px] py-[13.2px] text-base font-semibold bg-[#5046E5] text-white rounded-full transition-all !duration-300 hover:bg-transparent hover:text-[#5046E5] border-2 border-[#5046E5]">
                  Gallery
                </Link>
                <Link href="/scheduled-post" className="inline-flex cursor-pointer items-center justify-center px-[26.5px] py-[13.2px] text-base font-semibold bg-[#5046E5] text-white rounded-full transition-all !duration-300 hover:bg-transparent hover:text-[#5046E5] border-2 border-[#5046E5]">
                  Schedule Post
                </Link>
                <Link href="/report-analytics" className="inline-flex cursor-pointer items-center justify-center px-[26.5px] py-[13.2px] text-base font-semibold bg-[#5046E5] text-white rounded-full transition-all !duration-300 hover:bg-transparent hover:text-[#5046E5] border-2 border-[#5046E5]">
                  Report Analytics
                </Link>
              </div>
            </>
          ) : (
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center">
              <button 
                onClick={handleCustomAvatarClick}
                disabled={isAnyAvatarProcessing}
                className={`inline-flex items-center justify-center px-[26.5px] py-[13.2px] text-base font-semibold rounded-full transition-all !duration-300 border-2 ${
                  isAnyAvatarProcessing 
                    ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed' 
                    : 'bg-[#5046E5] text-white cursor-pointer hover:bg-transparent hover:text-[#5046E5] border-[#5046E5]'
                }`}
              >
                {isAnyAvatarProcessing ? 'Processing...' : 'Custom Avatar'}
              </button> 
              <button
                onClick={handleGetStartedClick}
                className="inline-flex cursor-pointer items-center justify-center px-[26.5px] py-[13.2px] text-base font-semibold bg-[#5046E5] text-white rounded-full transition-all !duration-300 hover:bg-transparent hover:text-[#5046E5] border-2 border-[#5046E5]"
              >
                Get Started
              </button>
            </div>
          )}
            </div>  
          </div>
        </div>
        <Image src="/images/Background.png" alt="Background" className="w-full h-full absolute lg:-bottom-24 bottom-0 left-0 z-0 object-contain" width={1440} height={1000} />
        <VideoCard />
      </section>

      <Partners />

      <section data-aos="fade-up">
        <Slider
          items={SLIDER_ITEMS}
          autoPlay={true}
          autoPlayInterval={5000}
          showArrows={true}
          showDots={true}
          className="mb-16"
        />
      </section>
      <ActionCard />

      <section id="how-it-works" data-aos="fade-up">
        <ProcessSteps />
      </section>

      <section id="benefits" data-aos="fade-up">
        <FeaturesSection />
      </section>

      <section id="pricing" data-aos="fade-up" className="mb-[300px]">
        <PricingSection />
      </section>

      <ReviewSlider
        items={REVIEW_SLIDER_ITEMS}
        autoPlay={true}
        autoPlayInterval={5000}
        showArrows={true}
        showDots={true}
        className="mb-0"
      />

      <section id="faq" data-aos="fade-up">
        <FAQSection />
      </section>

      <section id="contact" className="!block" data-aos="fade-up">
        <ContactForm />
      </section>

      {/* Avatar Creation Modal */}
      <AvatarCreationModal 
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
      />


    <SignupModal
        isOpen={isSignupModalOpen}
        onClose={() => setIsSignupModalOpen(false)}
        onOpenSignin={() => setIsSigninModalOpen(true)}
      />

      <ForgotPasswordModal
        isOpen={isForgotPasswordModalOpen}
        onClose={() => setIsForgotPasswordModalOpen(false)}
        onOpenSignin={() => setIsSigninModalOpen(true)}
      />

      {/* Signin Modal */}
      <SigninModal
        isOpen={isSigninModalOpen}
        onClose={handleCloseSigninModal}
        onOpenSignup={() => {
          setIsSigninModalOpen(false);
          setIsSignupModalOpen(true);
        }}
        onOpenForgotPassword={handleOpenForgotPasswordModal}
      />


      {/* Email Verification Modal */}
      <EmailVerificationModal
        isOpen={isEmailVerificationModalOpen}
        onClose={() => setIsEmailVerificationModalOpen(false)}
        email={verificationEmail}
      />

      {/* Pending Payment Toast */}
      <PendingPaymentToast
        isVisible={showPendingPaymentToast}
        message={pendingPaymentMessage}
        context={paymentContext}
        onClose={() => setShowPendingPaymentToast(false)}
        onRefresh={async () => {
          // Refresh subscription status
          try {
            const usageCheck = await checkVideoUsageLimit();
            if (usageCheck.canCreateVideo) {
              setShowPendingPaymentToast(false);
              showNotification('Payment confirmed! You can now create videos.', 'success');
            } else if (usageCheck.message?.includes('payment is still being processed')) {
              setPendingPaymentMessage(usageCheck.message);
            } else {
              setShowPendingPaymentToast(false);
              showNotification(usageCheck.message || 'Unable to create content', 'error');
            }
          } catch (error) {
            console.error('Failed to refresh subscription status:', error);
            showNotification('Unable to verify payment status. Please try again.', 'error');
          }
        }}
      />

      {/* Subscription Required Toast */}
      <SubscriptionRequiredToast
        isVisible={showSubscriptionRequiredToast}
        message={subscriptionRequiredMessage}
        context={subscriptionContext}
        onClose={() => setShowSubscriptionRequiredToast(false)}
        onSubscribe={() => {
          // Redirect to pricing page or scroll to pricing section
          window.location.href = '/#pricing'
        }}
      />
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5046E5] mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <HomePageContent />
    </Suspense>
  );
}