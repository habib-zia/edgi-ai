"use client";

import React, { useState, useEffect, useCallback } from 'react';
import SigninModal from './signin-modal';
import ForgotPasswordModal from './forgot-password-modal';
import PaymentModal from './payment-modal';
import SubscriptionManagementModal from './subscription-management-modal';
import { useAppSelector } from '@/store/hooks';
import { useNotificationStore } from './global-notification';
import { apiService, SubscriptionData } from '@/lib/api-service';
import SignupModal from './signup-modal';
import EmailVerificationModal from "./email-verification-modal";

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  buttonText: string;
  popular?: boolean;
  icon: React.ComponentType<{ className?: string; size?: number }>;
}

const PricingSection = () => {
  const [isSigninModalOpen, setIsSigninModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isManagementModalOpen, setIsManagementModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [apiPlans, setApiPlans] = useState<PricingPlan[] | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState<SubscriptionData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, accessToken } = useAppSelector((state) => state.user);
  const { showNotification } = useNotificationStore();

  const [isEmailVerificationModalOpen, setIsEmailVerificationModalOpen] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [isForgotPasswordModalOpen, setisForgotPasswordModalOpen] = useState(false);

  useEffect(() => {
    const fetchSubscription = async () => {
        try
        {
            setError(null)
            const response = await apiService.getCurrentSubscription()

            if (response.success && response.data)
            {

            } else
            {
                setError(response.message || 'Failed to fetch subscription details')
            }
        } catch (err)
        {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load subscription details'
            setError(errorMessage)
        } finally
        {
        }
    }

    fetchSubscription()
}, [])

  const fetchPricingPlans = useCallback(async () => {
    setError(null);

    try
    {
      const result = await apiService.getPricingPlans();

      if (result.success && result.data && result.data.plans)
      {
        setApiPlans(result.data.plans);
      } else
      {
        const errorMessage = result.message || 'Failed to fetch pricing plans';
        setError(errorMessage);
        showNotification(errorMessage, 'error');
      }

    } catch (err)
    {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch pricing plans';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally
    {
    }
  }, [showNotification]);

  const fetchCurrentSubscription = useCallback(async () => {
    if (!isAuthenticated) return;

    try
    {
      const response = await apiService.getCurrentSubscription();

      if (response.success && response.data && response.data.subscription)
      {
        setCurrentSubscription(response.data.subscription);
      } else
      {
      }
    } catch (err)
    {
      if (err instanceof Error && !err.message.includes('No active subscription'))
      {
        const errorMessage = err.message || 'Failed to load subscription details';
        showNotification(errorMessage, 'error');
      }
    }
  }, [isAuthenticated, showNotification]);

  useEffect(() => {
    fetchPricingPlans();
    fetchCurrentSubscription();
  }, [isAuthenticated, fetchCurrentSubscription, fetchPricingPlans]);

  const handlePlanSelection = async (plan: PricingPlan) => {
    if (!isAuthenticated || !accessToken)
    {
      showNotification('Please login first to access this feature', 'warning');
      setIsSigninModalOpen(true);
      return;
    }

    if (currentSubscription)
    {
      if (currentSubscription.planId === plan.id)
      {
        showNotification('This is your current plan', 'info');
        return;
      }
      setSelectedPlan(plan);
      setIsManagementModalOpen(true);
      showNotification(`Opening upgrade options for ${plan.name}`, 'info');
    } else
    {
      setSelectedPlan(plan);
      setIsPaymentModalOpen(true);
      showNotification(`Opening payment form for ${plan.name}`, 'info');
    }
  };

  const handleSubscriptionUpdated = () => {
    fetchCurrentSubscription();
  };

  const handleCloseSigninModal = () => {
    setIsSigninModalOpen(false);
  };

  const handleOpenForgotPasswordModal = () => {
    setisForgotPasswordModalOpen(true);
  };
  return (
    <>      
      <div className="mt-20 w-full py-20 bg-black relative overflow-visible" style={{ backgroundImage: `url('/images/price-bg.png')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundAttachment: 'fixed' }}>
          <div className='max-w-[1260px] px-3 mx-auto'>
            <h1 className='text-[#FFFFFF] font-semibold md:text-[42px] text-[40px] leading-[120%] text-center mb-2'>Flexible Pricing for <br className='md:block hidden' /> Content Automation</h1>
            <p className='text-[#FFFFFF] font-normal text-lg leading-[24px] text-center'>See examples of our AI-generated real estate marketing videos in action.</p>
            <div className='bg-white mt-[60px] -mb-[305px] rounded-[24px] lg:px-14 lg:py-16 md:p-8 p-6' style={{boxShadow: `0px 14px 31px 0px #0000001A, 0px 56px 56px 0px #00000017, 0px 125px 75px 0px #0000000D, 0px 223px 89px 0px #00000003, 0px 348px 97px 0px #00000000`
              }}
            >
              {apiPlans?.map((plan: PricingPlan, index: number) => {
                return (
              <div key={index} className='flex gap-4 md:flex-row flex-col'>
                {/* first wrapper */}
                <div className='flex flex-col gap-2 md:w-1/2 h-full md:min-h-[270px] justify-between'>
                  <div>
                    <h3 className='text-[#282828] font-semibold lg:text-[80px] text-[60px] leading-tight lg:mb-0 mb-3'>${Math.floor(Number(plan.price) / 100).toString()}<span className='text-[#282828] font-semibold text-[24px]'>/one-month</span></h3>
                    <p className='text-[#282828] font-medium text-base leading-[120%] max-w-[357px]'>Clone yourself into a lifelike AI avatar that talks, gestures, and feels human or choose from 1,000+ pre-built personalities across industries. Your face, your brand on autopilot.</p>
                  </div>
                  <div className='gap-4 flex-wrap md:flex hidden'>
                    {/* <button
                        className="md:w-fit w-full py-[11.2px] px-[28.3px] rounded-[39px] transition-all duration-300 bg-transparent text-[#282828] hover:bg-[#282828] border border-[#282828] hover:text-white text-[18px] leading-[20px] font-medium cursor-pointer"
                      >
                        Learn More
                      </button> */}
                    <button
                        onClick={() => handlePlanSelection(plan)}
                        className="md:w-fit w-full py-[11.2px] px-[28.3px] rounded-[39px] transition-all duration-300 bg-[#5046E5] text-white hover:bg-transparent border border-[#5046E5] hover:text-[#5046E5] text-[18px] leading-[20px] font-medium cursor-pointer ml-20"
                      >
                        Get Started
                      </button>
                  </div>
                </div>
                {/* second wrapper */}
                <div className='flex flex-col gap-2 md:w-1/2 w-full md:mt-0 mt-7'>
                  <h1 className='text-[#282828] font-semibold text-[24px] leading-tight'>Features</h1>
                  <div className='flex flex-col gap-5 mt-4'>
                    {apiPlans?.[0]?.features.map((feature: any, index: number) => (
                    <div key={index} className='flex items-center gap-3'>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.49 2 2 6.49 2 12C2 17.51 6.49 22 12 22C17.51 22 22 17.51 22 12C22 6.49 17.51 2 12 2ZM16.78 9.7L11.11 15.37C10.97 15.51 10.78 15.59 10.58 15.59C10.38 15.59 10.19 15.51 10.05 15.37L7.22 12.54C6.93 12.25 6.93 11.77 7.22 11.48C7.51 11.19 7.99 11.19 8.28 11.48L10.58 13.78L15.72 8.64C16.01 8.35 16.49 8.35 16.78 8.64C17.07 8.93 17.07 9.4 16.78 9.7Z" fill="#5046E5"/></svg>
                      <p className='text-[#282828] font-medium text-lg leading-[20px]'>{feature}</p>
                    </div>
                  ))}
                  </div>
                  <div className='gap-4 flex-wrap md:hidden flex mt-8'>
                    {/* <button
                        className="md:w-fit w-full py-[11.2px] px-[28.3px] rounded-[39px] transition-all duration-300 bg-transparent text-[#282828] hover:bg-[#282828] border border-[#282828] hover:text-white text-[18px] leading-[20px] font-medium cursor-pointer"
                      >
                        Learn More
                      </button> */}
                    <button
                        onClick={() => handlePlanSelection(plan)}
                        className="md:w-fit w-full py-[11.2px] px-[28.3px] rounded-[39px] transition-all duration-300 bg-[#5046E5] text-white hover:bg-transparent border border-[#5046E5] hover:text-[#5046E5] text-[18px] leading-[20px] font-medium cursor-pointer"
                      >
                        Get Started
                      </button>
                  </div>
                </div>
              </div>
              )})}
            </div>
          </div>

          <SignupModal
          isOpen={isSignupModalOpen}
          onClose={() => setIsSignupModalOpen(false)}
          onOpenSignin={() => setIsSigninModalOpen(true)}
        />

        <ForgotPasswordModal
          isOpen={isForgotPasswordModalOpen}
          onClose={() => setisForgotPasswordModalOpen(false)}
          onOpenSignin={() => setIsSigninModalOpen(true)}
        />

        <SigninModal
          isOpen={isSigninModalOpen}
          onClose={handleCloseSigninModal}
          onOpenSignup={() => {
            setIsSigninModalOpen(false);
            setIsSignupModalOpen(true);
          }}
          onOpenForgotPassword={handleOpenForgotPasswordModal}
        />
        <EmailVerificationModal
          isOpen={isEmailVerificationModalOpen}
          onClose={() => setIsEmailVerificationModalOpen(false)}
          email={verificationEmail}
        />
        <style jsx>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
        {selectedPlan && (
          <PaymentModal
            isOpen={isPaymentModalOpen}
            onClose={() => {
              setIsPaymentModalOpen(false);
              setSelectedPlan(null);
            }}
            plan={selectedPlan}
            onSuccess={() => {
              showNotification('Subscription activated successfully!', 'success');
              fetchCurrentSubscription();
            }}
          />
        )}

        <SubscriptionManagementModal
          isOpen={isManagementModalOpen}
          onClose={() => {
            setIsManagementModalOpen(false);
            setSelectedPlan(null);
          }}
          currentSubscription={currentSubscription}
          onSubscriptionUpdated={handleSubscriptionUpdated}
        />
      </div>
    </>
  );
};

export default PricingSection;