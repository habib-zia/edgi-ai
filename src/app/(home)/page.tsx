"use client";

import Link from "next/link";
import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SLIDER_ITEMS, REVIEW_SLIDER_ITEMS } from "@/lib/constants";
import { Slider } from "@/components/ui/slider";
import VideoCard from "@/components/ui/video-card";
import Image from "next/image";
import Partners from "@/components/ui/partners";
import ActionCard from "@/components/ui/action-card";
import { ContactForm, FeaturesSection } from "@/components/ui";
import FAQSection from "@/components/ui/FAQsection";
import { ReviewSlider } from "@/components/ui/review-slider";
import { ProcessSteps } from "@/components/ui/process-steps";
import PricingSection from "@/components/ui/pricing-section";

import { smoothScrollTo } from "@/lib/utils";
import SigninModal from "@/components/ui/signin-modal";
import { useState } from "react";
import { useAppSelector } from "@/store/hooks";
import { useNotificationStore } from "@/components/ui/global-notification";

function HomePageContent() {
  const [isSigninModalOpen, setIsSigninModalOpen] = useState(false);
  const { isAuthenticated } = useAppSelector((state) => state.user);
  const { showNotification } = useNotificationStore();
  const searchParams = useSearchParams();

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

  // Check for showLogin parameter to automatically open login modal
  useEffect(() => {
    const showLogin = searchParams.get('showLogin');
    if (showLogin === 'true')
    {
      setIsSigninModalOpen(true);
    }
  }, [searchParams]);

  // Check for email verification success
  useEffect(() => {
    const verified = searchParams.get('verified');
    if (verified === 'true')
    {
      // You could show a toast notification here
      console.log('Email verified successfully!');
    }
  }, [searchParams]);

  const handleGetStartedClick = (e: React.MouseEvent) => {
    if (isAuthenticated)
    {
      window.location.href = '/create-video';
    } else
    {
      e.preventDefault();
      smoothScrollTo('how-it-works');
    }
  };

  const handleReportAnalyticsClick = (e: React.MouseEvent) => {
    if (!isAuthenticated)
    {
      e.preventDefault();
      showNotification('Please sign in to view report analytics', 'info');
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
            <div className="flex flex-col sm:flex-row gap-4 justify-center">

              {isAuthenticated ? (
                <>
                  <Link href="/create-video" className="inline-flex cursor-pointer items-center justify-center px-[26.5px] py-[13.2px] text-base font-semibold bg-[#5046E5] text-white rounded-full transition-all !duration-300 hover:bg-transparent hover:text-[#5046E5] border-2 border-[#5046E5]">
                    Get Started
                  </Link>
                  <Link href="/report-analytics" className="inline-flex cursor-pointer items-center justify-center px-[26.5px] py-[13.2px] text-base font-semibold bg-[#5046E5] text-white rounded-full transition-all !duration-300 hover:bg-transparent hover:text-[#5046E5] border-2 border-[#5046E5]">
                    Report Analytics
                  </Link>
                </>
              ) : (
                <>
                  <button
                    onClick={handleGetStartedClick}
                    className="inline-flex cursor-pointer items-center justify-center px-[26.5px] py-[13.2px] text-base font-semibold bg-[#5046E5] text-white rounded-full transition-all !duration-300 hover:bg-transparent hover:text-[#5046E5] border-2 border-[#5046E5]"
                  >
                    Get Started
                  </button>
                  <button onClick={handleReportAnalyticsClick} className="inline-flex cursor-pointer items-center justify-center px-[26.5px] py-[13.2px] text-base font-semibold bg-[#5046E5] text-white rounded-full transition-all !duration-300 hover:bg-transparent hover:text-[#5046E5] border-2 border-[#5046E5]">
                    Report Analytics
                  </button>
                </>
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

      <section id="pricing" data-aos="fade-up">
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



      <section data-aos="fade-up">
        <FAQSection />
      </section>

      <section id="contact" className="!block" data-aos="fade-up">
        <ContactForm />
      </section>

      <SigninModal
        isOpen={isSigninModalOpen}
        onClose={() => setIsSigninModalOpen(false)}
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
