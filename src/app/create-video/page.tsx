"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useNotificationStore } from "@/components/ui/global-notification";
import { useSubscription } from "@/hooks/useSubscription";
import { useUnifiedSocketContext } from "@/components/providers/UnifiedSocketProvider";
import AvatarCreationModal from "@/components/ui/avatar-creation/AvatarCreationModal";
import PendingPaymentToast from "@/components/ui/pending-payment-toast";
import SubscriptionRequiredToast from "@/components/ui/subscription-required-toast";
import PreviousVideosGallery from "@/components/ui/previous-videos-gallery";
import ProtectedRoute from "@/components/features/auth/ProtectedRoute";
import Link from "next/link";

export default function CreateVideoPage() {
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [showPendingPaymentToast, setShowPendingPaymentToast] = useState(false);
  const [pendingPaymentMessage, setPendingPaymentMessage] = useState('');
  const [paymentContext, setPaymentContext] = useState<'video' | 'avatar'>('avatar');
  const [showSubscriptionRequiredToast, setShowSubscriptionRequiredToast] = useState(false);
  const [subscriptionRequiredMessage, setSubscriptionRequiredMessage] = useState('');
  const [subscriptionContext, setSubscriptionContext] = useState<'video' | 'avatar'>('avatar');

  const { user } = useSelector((state: RootState) => state.user);
  const { showNotification } = useNotificationStore();
  const { checkVideoUsageLimit } = useSubscription();
  const { isAvatarProcessing, isVideoAvatarProcessing } = useUnifiedSocketContext();
  const isAnyAvatarProcessing = isAvatarProcessing || isVideoAvatarProcessing;

  const handleCustomAvatarClick = async () => {
    if (isAnyAvatarProcessing) {
      showNotification('Please wait for your current avatar to finish processing', 'warning');
      return;
    }
    if (user?.id) {
      try {
        const usageCheck = await checkVideoUsageLimit();
        
        if (!usageCheck.canCreateVideo) {
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
        
        setIsAvatarModalOpen(true);
      } catch (error) {
        console.error('Failed to check subscription status:', error);
        showNotification('Unable to verify subscription status. Please try again.', 'error');
      }
    } else {
      showNotification('Please log in to create a custom avatar', 'warning');
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white">
        <div className="max-w-[1260px] mx-auto xl:px-0 px-3 lg:py-20 py-10">
          <div className="text-center mb-8">
            <h1 className="text-[37px] md:text-4xl leading-[40px] lg:text-[42px] font-semibold text-[#171717] mb-4">
              Create Videos Effortlessly
            </h1>
            <p className="text-lg md:text-[20px] text-[#5F5F5F] max-w-3xl mx-auto leading-[24px]">
              Custom AI videos for agents & loan officers—just fill one form, <br className="hidden md:block" /> hit submit, and we handle the rest.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10">
            <button 
              onClick={handleCustomAvatarClick}
              disabled={isAnyAvatarProcessing}
              className={`inline-flex items-center md:w-fit w-full justify-center px-4 py-[9.4px] md:text-[20px] text-[18px] font-semibold rounded-full transition-all !duration-300 border-2 ${
                isAnyAvatarProcessing 
                  ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed' 
                  : 'bg-[#5046E5] text-white cursor-pointer hover:bg-transparent hover:text-[#5046E5] border-[#5046E5]'
              }`}>
              {isAnyAvatarProcessing ? 'Processing...' : 'Custom Avatar'}
            </button>
            <Link
              href="/create-video/talking-head"
              className="inline-flex items-center md:max-w-[167px] max-w-full w-full justify-center gap-2 px-6 py-[9.4px] bg-[#5046E5] text-white rounded-full md:text-[20px] text-[18px] hover:bg-transparent hover:text-[#5046E5] border-2 border-[#5046E5] transition-all duration-300 font-semibold whitespace-nowrap"
            >
              Create Video
            </Link>
          </div>

          <div className="pt-4">
            <PreviousVideosGallery />
          </div>
        </div>

        <AvatarCreationModal 
          isOpen={isAvatarModalOpen}
          onClose={() => setIsAvatarModalOpen(false)}
        />

        <PendingPaymentToast
          isVisible={showPendingPaymentToast}
          message={pendingPaymentMessage}
          context={paymentContext}
          onClose={() => setShowPendingPaymentToast(false)}
          onRefresh={async () => {
            try {
              const usageCheck = await checkVideoUsageLimit();
              if (usageCheck.canCreateVideo) {
                setShowPendingPaymentToast(false);
                showNotification('Payment confirmed! You can now create avatars.', 'success');
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

        <SubscriptionRequiredToast
          isVisible={showSubscriptionRequiredToast}
          message={subscriptionRequiredMessage}
          context={subscriptionContext}
          onClose={() => setShowSubscriptionRequiredToast(false)}
          onSubscribe={() => {
            window.location.href = '/#pricing'
          }}
        />
      </div>
    </ProtectedRoute>
  );
}
