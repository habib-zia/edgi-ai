"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Check, Zap, Users, BarChart3 } from 'lucide-react';
import Image from 'next/image';
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

interface EnterprisePlan {
  name: string;
  subtitle: string;
  features: string[];
  buttonText: string;
}



const PricingSection = () => {
  const [isSigninModalOpen, setIsSigninModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isManagementModalOpen, setIsManagementModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [apiPlans, setApiPlans] = useState<PricingPlan[] | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, accessToken } = useAppSelector((state) => state.user);
  const { showNotification } = useNotificationStore();

  const [isEmailVerificationModalOpen, setIsEmailVerificationModalOpen] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [isForgotPasswordModalOpen, setisForgotPasswordModalOpen] = useState(false);
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)




  useEffect(() => {
    const fetchSubscription = async () => {
        try
        {
            setLoading(true)
            setError(null)
            const response = await apiService.getCurrentSubscription()

            if (response.success && response.data)
            {
                setSubscription(response.data.subscription)
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
            setLoading(false)
        }
    }

    fetchSubscription()
}, [])

  // API fetch function
  const fetchPricingPlans = useCallback(async () => {
    setIsLoading(true);
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
      setIsLoading(false);
    }
  }, [showNotification]);

  // Fetch current subscription
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
        // Don't show error toast for "no subscription found" as it's normal for new users
        // No action needed - this is expected for new users
      }
    } catch (err)
    {
      // Only show toast for actual errors, not "no subscription found"
      if (err instanceof Error && !err.message.includes('No active subscription'))
      {
        const errorMessage = err.message || 'Failed to load subscription details';
        showNotification(errorMessage, 'error');
      }
    }
  }, [isAuthenticated, showNotification]);

  // UseEffect to fetch data on component mount
  useEffect(() => {
    fetchPricingPlans();
    fetchCurrentSubscription();
  }, [isAuthenticated, fetchCurrentSubscription, fetchPricingPlans]);

  // Handle plan selection
  const handlePlanSelection = async (plan: PricingPlan) => {
    if (!isAuthenticated || !accessToken)
    {
      showNotification('Please login first to access this feature', 'warning');
      setIsSigninModalOpen(true);
      return;
    }

    // Check if user has current subscription
    if (currentSubscription)
    {
      // If user has subscription, open management modal for upgrade
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
      // If no subscription, open payment modal for new subscription
      setSelectedPlan(plan);
      setIsPaymentModalOpen(true);
      showNotification(`Opening payment form for ${plan.name}`, 'info');
    }
  };

  // Handle subscription updates
  const handleSubscriptionUpdated = () => {
    fetchCurrentSubscription();
  };

  // Handle enterprise plan contact
  const handleEnterpriseContact = () => {
    if (!isAuthenticated)
    {
      showNotification('Please login first to access this feature', 'warning');
      setIsSigninModalOpen(true);
      return;
    }

    showNotification('Enterprise team will contact you soon!', 'success');

    // TODO: Implement enterprise contact form or redirect
    // This could open a contact modal, redirect to a contact page,
    // or trigger an API call to notify the sales team
  };

  // Get button text and style for plan
  const getPlanButtonInfo = (plan: PricingPlan) => {
    if (!currentSubscription)
    {
      return {
        text: plan.buttonText,
        isCurrent: false,
        isUpgrade: false
      };
    }

    if (currentSubscription.planId === plan.id)
    {
      return {
        text: 'Current Plan',
        isCurrent: true,
        isUpgrade: false
      };
    }

    return {
      text: 'Upgrade',
      isCurrent: false,
      isUpgrade: true
    };
  };

  // Static design data that doesn't come from API
  const staticPlanData = {
    basic: {
      period: '/one-time',
      description: 'Ideal for new users who want to manage basic finances at no cost.',
      features: [
        'Basic Customization',
        '24-48 hr email support'
      ],
      buttonText: 'Get Started',
      icon: Zap,
      popular: false
    },
    growth: {
      period: '/month',
      description: 'Ideal for users who want more control over personal finance management.',
      features: [
        '1 Avatar',
        'Priority 36-hour email support',
        'Advanced Customization',
        'Social Media Optimization'
      ],
      buttonText: 'Try Premium',
      icon: Users,
      popular: true
    },
    professional: {
      period: '/month',
      description: 'Ideal for professionals that require comprehensive financial management.',
      features: [
        '1 Avatar',
        'Full Customization suite',
        'Advanced Analytics Dashboard',
        'Quarterly AI Strategy Session (15 min)'
      ],
      buttonText: 'Get Professional',
      icon: BarChart3,
      popular: false
    }
  };

  // Function to merge API data with static design data
  const createDynamicPricingPlans = (): PricingPlan[] => {
    if (!apiPlans || !Array.isArray(apiPlans))
    {
      // Fallback to original static data if API data is not available
      return [
        {
          id: 'basic',
          name: 'Basic Plan',
          price: '$99',
          period: '/one-time',
          description: 'Ideal for new users who want to manage basic finances at no cost.',
          features: [
            '1 AI video',
            '1 Avatar',
            'Basic Customization',
            '24-48 hr email support'
          ],
          buttonText: 'Get Started',
          icon: Zap
        },
        {
          id: 'growth',
          name: 'Growth Plan',
          price: '$199',
          period: '/month',
          description: 'Ideal for users who want more control over personal finance management.',
          features: [
            '4 AI videos per month',
            '1 Avatar',
            'Priority 36-hour email support',
            'Advanced Customization',
            'Social Media Optimization'
          ],
          buttonText: 'Try Premium',
          popular: true,
          icon: Users
        },
        {
          id: 'professional',
          name: 'Professional Plan',
          price: '$399',
          period: '/month',
          description: 'Ideal for professionals that require comprehensive financial management.',
          features: [
            '12 AI videos per month',
            '1 Avatar',
            'Full Customization suite',
            'Advanced Analytics Dashboard',
            'Quarterly AI Strategy Session (15 min)'
          ],
          buttonText: 'Get Professional',
          icon: BarChart3
        }
      ];
    }

    return apiPlans.map((apiPlan: any) => {
      const staticData = staticPlanData[apiPlan.id as keyof typeof staticPlanData];

      // Convert price from cents to dollars
      const priceInDollars = (apiPlan.price / 100).toFixed(0);

      // Create dynamic features array
      const dynamicFeatures = [];

      // Add video limit from API
      if (apiPlan.videoLimit)
      {
        if (apiPlan.videoLimit === 1)
        {
          dynamicFeatures.push(`${apiPlan.videoLimit} AI video`);
        } else
        {
          dynamicFeatures.push(`${apiPlan.videoLimit} AI videos per month`);
        }
      }

      // Add static features from our design
      if (staticData?.features)
      {
        dynamicFeatures.push(...staticData.features);
      }

      return {
        id: apiPlan.id,
        name: apiPlan.name,
        price: `$${priceInDollars}`,
        period: staticData?.period || '/month',
        description: staticData?.description || 'Professional plan for your needs.',
        features: dynamicFeatures,
        buttonText: staticData?.buttonText || 'Get Started',
        popular: staticData?.popular || false,
        icon: staticData?.icon || Zap,

      };
    });
  };

  // Get the dynamic pricing plans
  const pricingPlans: PricingPlan[] = createDynamicPricingPlans();

  const enterprisePlan: EnterprisePlan = {
    name: 'Enterprise',
    subtitle: 'Contact Sales',
    features: [
      'All basic features',
      'Customizable budgeting categories',
      'Investment tracking tools',
      'Priority customer support',
      'Weekly financial reports',
      'Custom integrations'
    ],
    buttonText: 'Get Started'
  };


  const handleCloseSigninModal = () => {
    setIsSigninModalOpen(false);
  };

  const handleOpenForgotPasswordModal = () => {
    setisForgotPasswordModalOpen(true);
  };

  const features = [
    {
      id: 1,
      title: 'Your Personal AI Digital Twin',
    },
    {
      id: 2,
      title: 'Smart Topic Discovery',
    },
    {
      id: 3,
      title: 'Customizable Script Generation',
    },
    {
      id: 4,
      title: 'Studio-Quality Video in 90 Seconds',
    },
    {
      id: 5,
      title: 'Auto-Posting Across Social Platforms',
    },
    {
      id: 6,
      title: 'Unified Data Dashboard',
    },
    {
      id: 7,
      title: 'Momentum-Driven Video Generation',
    },
  ]


  return (
    <>
      <section className="w-full py-20 bg-black relative overflow-hidden" style={{ backgroundImage: `url('/images/price-bg.png')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundAttachment: 'fixed' }}>
        <div className="max-w-[1260px] mx-auto xl:px-0 px-3 relative z-10">
          {/* Header Section */}
          <div className="text-center mb-16">
            <h1 className="text-[32px] md:text-[42px] font-semibold text-white mb-2 leading-tight">
              Flexible Pricing for Every Budget
            </h1>
            <p className="text-[18px] text-white max-w-3xl mx-auto leading-relaxed">
              See examples of our AI-generated real estate marketing videos in action.
            </p>
          </div>

          {/* Top Row - Three Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 mb-7 pt-5">
            {pricingPlans.map((plan, index) => {
              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl p-[2px] transition-all duration-300`}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: 'fadeInUp 0.6s ease-out forwards',
                    background: 'radial-gradient(194.57% 261.75% at 22.9% 2.98%, rgba(216, 216, 216, 0) 0%, #D8D8D8 100%)',
                  }}
                >
                  {/* Plan Name Tab */}
                  <div className="absolute z-10 border border-[#D8D8D8] flex items-center justify-center -top-[27px] left-1/2 px-[31px] w-fit min-h-[52px] rounded-full transform backdrop-blur-2xl -translate-x-1/2 bg-gradient-to-r from-white/40 to-white/0" style={{ minWidth: 'max-content' }}>
                    <span className="text-white text-[24px] font-semibold text-center leading-[20px]">
                      {plan.name}
                    </span>
                  </div>
                  {/* Popular Badge */}
                  {plan.popular && (
                    <div className='absolute top-[-67px] right-16 !z-20'>
                      <Image src="/images/crown.png" className='relative z-20' alt="crown" width={67} height={67} />
                    </div>
                  )}
                  <div className='bg-black w-full h-full rounded-[14px]'>
                    {/* Inner card content */}
                    <div
                      className="relative rounded-[14px] p-6 h-full"
                      style={{
                        background: '#141416',
                      }}
                    >
                      <div className='flex flex-col justify-between h-full gap-8'>
                        <div className='flex flex-col'>


                          {/* Plan Header */}
                          <div className="pt-3">
                            <div className="mb-0">
                              <span className="text-[30px] md:text-[42px] font-semibold text-white">{plan.price} </span>
                              <span className="text-white text-[18px] md:text-[24px]">{plan.period}</span>
                            </div>
                            <p className="text-white text-[18px] font-medium leading-[150%]">{plan.description}</p>
                          </div>

                          <div className='h-[2px] w-full bg-[#D5DBFA1A] my-6'></div>

                          {/* Features List */}
                          <div className="space-y-4">
                            {plan.features.map((feature, featureIndex) => (
                              <div key={featureIndex} className="flex items-center gap-3">
                                <div className="w-[20px] h-[20px] bg-[#EDEDED] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <Check className="text-[#171717]" size={14} />
                                </div>
                                <span className="text-white text-[18px] font-medium leading-[20px]">{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* CTA Button */}
                        <div className="flex justify-center">
                          {(() => {
                            const buttonInfo = getPlanButtonInfo(plan);
                            
                            // If subscription is cancelled, only show the current plan button
                            if (subscription?.cancelAtPeriodEnd && !buttonInfo.isCurrent) {
                              return null;
                            }
                            
                            return (
                              <button
                                onClick={() => handlePlanSelection(plan)}
                                className={`py-[11.6px] px-[28.3px] rounded-[39px] transition-all duration-300 text-[18px] leading-[20px] font-medium cursor-pointer flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 ${buttonInfo.isCurrent
                                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white border border-green-500 hover:from-green-600 hover:to-green-700 shadow-green-500/25'
                                  : buttonInfo.isUpgrade
                                    ? 'bg-gradient-to-r from-[#5046E5] to-[#4338CA] text-white border border-[#5046E5] hover:from-[#4338CA] hover:to-[#3730A3] shadow-[#5046E5]/25'
                                    : 'bg-gradient-to-r from-[#5046E5] to-[#4338CA] text-white border border-[#5046E5] hover:from-[#4338CA] hover:to-[#3730A3] shadow-[#5046E5]/25'
                                  }`}
                                data-plan-id={plan.id}
                                disabled={buttonInfo.isCurrent}
                              >
                                {buttonInfo.isCurrent && <Check className="h-4 w-4" />}
                                {buttonInfo.text}
                              </button>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Section - Enterprise */}
          <div
            className="relative rounded-2xl p-[2px]"
            style={{
              background: 'radial-gradient(194.57% 261.75% at 22.9% 2.98%, rgba(216, 216, 216, 0) 0%, #D8D8D8 100%)',
            }}
          >
            <div className='bg-black w-full h-full rounded-[14px]'>
              <div
                className="rounded-[14px] p-8 sm:p-12 border-0"
                style={{
                  background: '#141416',
                }}
              >
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
                  {/* Enterprise Content */}
                  <div>
                    <h3 className="text-[42px] font-semibold text-white">{enterprisePlan.name}</h3>
                    <p className="text-white text-[18px] font-medium leading-[150%] mb-8">{enterprisePlan.subtitle}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                      {enterprisePlan.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="w-[20px] h-[20px] bg-[#EDEDED] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="text-[#171717]" size={14} />
                          </div>
                          <span className="text-white text-[18px] font-medium leading-[20px]">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Enterprise Button */}
                  <div className="lg:flex-shrink-0">
                    <button
                      onClick={handleEnterpriseContact}
                      className="w-fit py-[11.6px] px-[28.3px] rounded-[39px] transition-all duration-300 bg-[#5046E5] text-white hover:bg-transparent border border-[#5046E5] hover:text-white text-[18px] leading-[20px] font-medium cursor-pointer"
                      data-plan-id="enterprise"
                    >
                      {enterprisePlan.buttonText}
                    </button>
                  </div>
                </div>
              </div>
            </div>

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
              // Refresh subscription data after successful payment
              fetchCurrentSubscription();
            }}
          />
        )}

        {/* Subscription Management Modal */}
        <SubscriptionManagementModal
          isOpen={isManagementModalOpen}
          onClose={() => {
            setIsManagementModalOpen(false);
            setSelectedPlan(null);
          }}
          currentSubscription={currentSubscription}
          onSubscriptionUpdated={handleSubscriptionUpdated}
        />
      </section>

      
      <div className="mt-20 w-full py-20 bg-black relative overflow-visible" style={{ backgroundImage: `url('/images/price-bg.png')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundAttachment: 'fixed' }}>
          <div className='max-w-[1260px] px-3 mx-auto'>
            <h1 className='text-[#FFFFFF] font-semibold md:text-[42px] text-[40px] leading-[120%] text-center mb-2'>Flexible Pricing for <br/> Content Automation</h1>
            <p className='text-[#FFFFFF] font-normal text-lg leading-[24px] text-center'>See examples of our AI-generated real estate marketing videos in action.</p>
            <div className='bg-white mt-[60px] -mb-[305px] rounded-[24px] lg:px-14 lg:py-16 md:p-8 p-6' style={{boxShadow: `0px 14px 31px 0px #0000001A, 0px 56px 56px 0px #00000017, 0px 125px 75px 0px #0000000D, 0px 223px 89px 0px #00000003, 0px 348px 97px 0px #00000000`
              }}
            >
              <div className='flex gap-4 md:flex-row flex-col'>
                {/* first wrapper */}
                <div className='flex flex-col gap-2 md:w-1/2 h-full md:min-h-[340px] justify-between'>
                  <div>
                    <h3 className='text-[#282828] font-semibold lg:text-[80px] text-[60px] leading-tight lg:mb-0 mb-3'>$997<span className='text-[#282828] font-semibold text-[24px]'>/one-time</span></h3>
                    <p className='text-[#282828] font-medium text-base leading-[120%] max-w-[357px]'>Clone yourself into a lifelike AI avatar that talks, gestures, and feels human or choose from 1,000+ pre-built personalities across industries. Your face, your brand on autopilot.</p>
                  </div>
                  <div className='gap-4 flex-wrap md:flex hidden'>
                    <button
                        onClick={handleEnterpriseContact}
                        className="md:w-fit w-full py-[11.2px] px-[28.3px] rounded-[39px] transition-all duration-300 bg-transparent text-[#282828] hover:bg-[#282828] border border-[#282828] hover:text-white text-[18px] leading-[20px] font-medium cursor-pointer"
                        data-plan-id="enterprise"
                      >
                        Learn More
                      </button>
                    <button
                        onClick={handleEnterpriseContact}
                        className="md:w-fit w-full py-[11.2px] px-[28.3px] rounded-[39px] transition-all duration-300 bg-[#5046E5] text-white hover:bg-transparent border border-[#5046E5] hover:text-[#5046E5] text-[18px] leading-[20px] font-medium cursor-pointer"
                        data-plan-id="enterprise"
                      >
                        {enterprisePlan.buttonText}
                      </button>
                  </div>
                </div>
                {/* second wrapper */}
                <div className='flex flex-col gap-2 md:w-1/2 w-full md:mt-0 mt-7'>
                  <h1 className='text-[#282828] font-semibold text-[24px] leading-tight'>Features</h1>
                  <div className='flex flex-col gap-5 mt-4'>
                    {features.map((feature: any) => (
                      <div key={feature.id} className='flex items-center gap-3'>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.49 2 2 6.49 2 12C2 17.51 6.49 22 12 22C17.51 22 22 17.51 22 12C22 6.49 17.51 2 12 2ZM16.78 9.7L11.11 15.37C10.97 15.51 10.78 15.59 10.58 15.59C10.38 15.59 10.19 15.51 10.05 15.37L7.22 12.54C6.93 12.25 6.93 11.77 7.22 11.48C7.51 11.19 7.99 11.19 8.28 11.48L10.58 13.78L15.72 8.64C16.01 8.35 16.49 8.35 16.78 8.64C17.07 8.93 17.07 9.4 16.78 9.7Z" fill="#5046E5"/></svg>
                        <p className='text-[#282828] font-medium text-lg leading-[20px]'>{feature.title}</p>
                      </div>
                  ))}
                  </div>
                  <div className='gap-4 flex-wrap md:hidden flex mt-8'>
                    <button
                        onClick={handleEnterpriseContact}
                        className="md:w-fit w-full py-[11.2px] px-[28.3px] rounded-[39px] transition-all duration-300 bg-transparent text-[#282828] hover:bg-[#282828] border border-[#282828] hover:text-white text-[18px] leading-[20px] font-medium cursor-pointer"
                        data-plan-id="enterprise"
                      >
                        Learn More
                      </button>
                    <button
                        onClick={handleEnterpriseContact}
                        className="md:w-fit w-full py-[11.2px] px-[28.3px] rounded-[39px] transition-all duration-300 bg-[#5046E5] text-white hover:bg-transparent border border-[#5046E5] hover:text-[#5046E5] text-[18px] leading-[20px] font-medium cursor-pointer"
                        data-plan-id="enterprise"
                      >
                        {enterprisePlan.buttonText}
                      </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </div>
    </>
  );
};

export default PricingSection;