"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { AvatarCreationModal } from './avatar-creation';
import { useRouter } from "next/navigation";
import { useNotificationStore } from './global-notification';
import SignupModal from "./signup-modal";
import ForgotPasswordModal from "./forgot-password-modal";
import SigninModal from "./signin-modal";
import EmailVerificationModal from "./email-verification-modal";
import { useSubscription } from '@/hooks/useSubscription';
import PendingPaymentToast from './pending-payment-toast';
import SubscriptionRequiredToast from './subscription-required-toast';

interface Step {
  id: string;
  number: string;
  title: string;
  description: string;
}

interface ProcessStepsProps {
  className?: string;
}

const steps: Step[] = [
  {
    id: "step-1",
    number: "1",
    title: "Fill One Simple Form",
    description: "Send a quick 5-minute video of yourself speaking, then fill out a 1-page prompt with your video topic and key details."
  },
  {
    id: "step-2", 
    number: "2",
    title: "Click Submit",
    description: "Submit your prompt, let AI script it, you approve, and we deliver a fully edited video with your avatar, voice, captions, and music."
  },
  {
    id: "step-3",
    number: "3", 
    title: "Receive Your Video",
    description: "Get your client-ready video in 24-48 hours—perfect for social, email, or any marketing channel."
  }
];

export function ProcessSteps({ className }: ProcessStepsProps) {
  const router = useRouter();
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  
  // Modal states
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isSigninModalOpen, setIsSigninModalOpen] = useState(false);
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

  const handleCustomAvatarClick = async () => {
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

  const handleCustomVideoClickTest =  () => {
    setIsAvatarModalOpen(true);
  };

  const handleDefaultAvatarClick = async () => {
    if (user?.id) {
      // Check payment status before allowing video creation
      console.log('Checking payment status before allowing video creation');
      console.log('User ID:', user.id);
      try {
        const usageCheck = await checkVideoUsageLimit();
        console.log('Usage check:', usageCheck);
        
        if (!usageCheck.canCreateVideo) {
          // Check if it's a pending payment issue
          console.log('Payment is still being processed');
          if (usageCheck.message?.includes('payment is still being processed')) {
            setPaymentContext('video');
            setPendingPaymentMessage(usageCheck.message);
            setShowPendingPaymentToast(true);
            return;
          } else if (usageCheck.message?.includes('No active subscription found') || usageCheck.message?.includes('Please subscribe')) {
            setSubscriptionContext('video');
            setSubscriptionRequiredMessage(usageCheck.message);
            setShowSubscriptionRequiredToast(true);
            return;
          } else {
            showNotification(usageCheck.message || 'Unable to create video', 'error');
            return;
          }
        }
        
        // Payment is active, proceed with video creation
        router.push('/create-video/new');
      } catch (error) {
        console.error('Failed to check subscription status:', error);
        showNotification('Unable to verify subscription status. Please try again.', 'error');
      }
    } else {
      // User is not logged in, show notification and open signup modal
      showNotification('Please log in to create a default avatar', 'warning');
      setIsSigninModalOpen(true);
    }
  };

  // Modal handler functions
  const handleCloseSigninModal = () => {
    setIsSigninModalOpen(false);
  };

  const handleOpenForgotPasswordModal = () => {
    setIsSigninModalOpen(false);
    setIsForgotPasswordModalOpen(true);
  };

  return (
    <section className={cn("w-full py-14 bg-white", className)}>
      <div className="max-w-[1260px] mx-auto xl:px-0 px-3">
        {/* Header Section */}
        <div className="text-center mb-10">
          <h2 className="text-[42px] md:text-[54px] lg:text-[64px] font-semibold text-[#282828] leading-tight mb-3">
            Three simple steps.
          </h2>
          <p className="text-[18px] md:text-[20px] text-[#5F5F5F] max-w-[800px] mx-auto leading-relaxed">
            Our streamlined process makes creating professional real estate videos effortless.
          </p>
        </div>

        {/* Steps Container */}
        <div className="relative mb-10">
          {/* Desktop Chevron Layout */}
          <div className="hidden xl:block">           
            <div className="relative grid grid-cols-3 gap-10 w-full" style={{
              backgroundImage: "url('/images/background-vector.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              maxHeight: "45vh",
              height: "100%",
              width: "100%",
            }}>
              <div className="flex flex-col items-start justify-start h-full w-full px-12 py-11">
                <div className="h-[40px] w-[40px] bg-white/40 rounded-full flex items-center justify-center mb-4">
                  <span className="text-white text-[18px] font-semibold">1</span>
                </div>
                <div>
                  <h1 className="text-white text-[40px] font-semibold leading-[42px]">Fill One <br /> Simple Form</h1>
                  <p className="text-white text-[18px] mt-2 font-medium leading-[24px] max-w-[280px]">Send a quick 5-minute video of yourself speaking, then fill out a 1-page prompt with your video topic and key details.</p>
                </div>
              </div>
              <div className="flex flex-col items-start justify-start h-full w-full px-12 py-11">
                <div className="h-[40px] w-[40px] bg-white/40 rounded-full flex items-center justify-center mb-4">
                  <span className="text-white text-[18px] font-semibold">2</span>
                </div>
                <div>
                  <h1 className="text-white text-[40px] font-semibold leading-[42px]">Click <br /> Submit</h1>
                  <p className="text-white text-[18px] mt-2 font-medium leading-[24px] max-w-[300px]">Submit your prompt, let AI script it, you approve, and we deliver a fully edited video with your avatar, voice, captions, and music.</p>
                </div>
              </div>
              <div className="flex flex-col items-start justify-start h-full w-full px-4 py-11">
                <div className="h-[40px] w-[40px] bg-white/40 rounded-full flex items-center justify-center mb-4">
                  <span className="text-white text-[18px] font-semibold">3</span>
                </div>
                <div>
                  <h1 className="text-white text-[40px] font-semibold leading-[42px]">Receive Your <br /> Video</h1>
                  <p className="text-white text-[18px] mt-4 font-medium leading-[24px] max-w-[280px]">Get your client-ready video in 24-48 hours—perfect for social, email, or any marketing channel.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile/Tablet Layout */}
          <div className="xl:hidden space-y-6">
            <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4">
            {steps.map((step) => (
              <div key={step.id} className="relative">
                <div className={`rounded-[12px] p-6 text-white h-fit md:min-h-[290px] min-h-[200px] ${step.id === "step-1" ? "bg-[#5046E5]" : "bg-[#6C63F0]"} ${step.id === "step-3" && "bg-[#8179F0]"}`}>
                  {/* Number Circle */}
                  <div className="w-[40px] h-[40px] rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                    <span className="text-white font-semibold">{step.number}</span>
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-[24px] md:text-[28px] font-semibold mb-3 leading-tight">
                    {step.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-[14px] md:text-[16px] text-white/90 leading-relaxed">
                    {step.description}
                  </p>
                </div>
                
                {/* Connecting Line */}
                {/* {index < steps.length - 1 && (
                  <div className="md:hidden flex justify-center py-4">
                    <div className="w-0.5 h-8 bg-gradient-to-b from-[#6366f1] to-[#a855f7]"></div>
                  </div>
                )} */}
              </div>
            ))}
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center flex gap-4 justify-center flex-wrap">
          {/* <Link 
            href="#faq" 
            className="inline-flex items-center gap-3 bg-transparent border-2 border-[#5046E5] text-[#5046E5] hover:bg-[#5046E5] hover:text-white py-[15.4px] rounded-full text-[16px] font-semibold transition-all duration-300 group max-w-[340px] w-full text-center justify-center mx-auto"
          >
            Have More Questions? See our FAQ
          </Link> */}
          <button 
            onClick={handleCustomVideoClickTest}
            className="inline-flex md:w-fit w-full items-center gap-3 bg-transparent border-2 border-[#5046E5] text-[#5046E5] hover:bg-[#5046E5] hover:text-white py-[7.4px] rounded-full text-[20px] font-semibold transition-colors duration-300 group md:max-w-[192px] max-w-full text-center justify-center px-4"
          >
            Custom Avatar
          </button>
          <button 
            onClick={handleDefaultAvatarClick}
            className="inline-flex md:w-fit w-full items-center gap-3 bg-transparent border-2 border-[#5046E5] text-[#5046E5] hover:bg-[#5046E5] hover:text-white py-[7.4px] rounded-full text-[20px] font-semibold transition-colors duration-300 group md:max-w-[192px] max-w-full text-center justify-center px-4 cursor-pointer"
          >
            Default Avatar
          </button>
        </div>
      </div>

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
    </section>
  );
}
