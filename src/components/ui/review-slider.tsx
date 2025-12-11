"use client";

import * as React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, Keyboard } from "swiper/modules";
import { cn } from "@/lib/utils";
import Image from "next/image";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface SliderItem {
  id: string;
  content: string;
  stars: number;
  name: string;
  image: string;
}

interface SliderProps {
  items: SliderItem[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showArrows?: boolean;
  showDots?: boolean;
  className?: string;
}

export function ReviewSlider({
  items,
  autoPlay = true,
  autoPlayInterval = 5000,
  showArrows = true,
  showDots = true,
}: SliderProps) {
  if (!items.length) return null;

  return (
    <div className={cn("relative w-full max-w-[1260px] mx-auto px-3 py-14")}>
      <div className="flex flex-col justify-between items-center gap-5">
      <h2 className="text-[32px] md:text-[42px] font-semibold text-[#171717] text-center leading-[120%]">
      What Our Clients Are Saying
      </h2>
      <p className="md:text-[20px] text-[18px] leading-[24px] mb-6 flex-grow text-[#5F5F5F] text-center max-w-[650px] mx-auto">
      See how EdgeAI Realty has helped real estate agents and loan officers transform their marketing strategies.
      </p>
      </div>
    <div className="relative">
      <Swiper
        modules={[Navigation, Pagination, Autoplay, Keyboard]}
        spaceBetween={0}
        slidesPerView={1}
        breakpoints={{
          640: {
            slidesPerView: 2,
            spaceBetween: 10,
          },
          1024: {
            slidesPerView: 3,
            spaceBetween: 10,
          },
        }}
        loop={true}
        speed={600}
        autoplay={
          autoPlay
            ? {
                delay: autoPlayInterval,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }
            : true
        }
        keyboard={{
          enabled: true,
          onlyInViewport: true,
        }}
        navigation={
          showArrows
            ? {
                nextEl: ".review-swiper-button-next",
                prevEl: ".review-swiper-button-prev",
              }
            : false
        }
        pagination={
          showDots
            ? {
                el: ".review-swiper-pagination",
                clickable: true,
                dynamicBullets: false,
                renderBullet: function (index, className) {
                  return `<span class="${className}"></span>`;
                },
              }
            : true
        }
        className="review-swiper-container"
      >
        {items.map((item) => (
          <SwiperSlide key={item.id} className="swiper-slide px-3">
            <div className="bg-[#ECEFFD] border border-[#D9D9D9] rounded-[24px] h-full min-h-[300px] flex flex-col justify-between">
            <div className="px-5 pt-5 pb-5">
              {/* Attribution */}
              {item.content && (
                <p className="md:text-[18px] text-[16px] text-[#717171]">
                  &quot;{item.content}&quot;
                </p>
              )}
              </div>
              <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#12144E]/50 to-[#12144E]/8"></div>
              <div className="px-5 pb-5 pt-3">
              <div className="flex items-center gap-3">
                <Image src={item.image} alt={item.name} width={56} height={56} className="md:w-[56px] md:h-[56px] w-[48px] h-[48px] rounded-full" />
                <div className="flex flex-col gap-1">
                    <h3 className="text-[18px] font-medium text-[#171717]">{item.name}</h3>
                    <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, index) => (
                        <svg key={index} className={`w-4 h-4 ${index < item.stars ? 'text-[#FFDC23]' : 'text-[#D9D9D9]'}`} fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 17.27L18.18 21 16.54 13.97 22 9.24 14.81 8.63 12 2 9.19 8.63 2 9.24 7.46 13.97 5.82 21 12 17.27z" />
                        </svg>
                        ))}
                    </div>
                </div>
              </div> 
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Navigation Arrows */}
      {showArrows && (
        <>
          <div className="review-swiper-button-prev !transition-all !duration-300 !text-[#757575] xl:!-left-2 left-0 !top-[42%]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </div>
          <div className="review-swiper-button-next !text-[#757575] xl:!-right-2 right-0 !top-[42%]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </>
      )}

      {/* Custom Pagination Dots - Outside Swiper */}
      {showDots && (
        <div className="review-swiper-pagination flex justify-center space-x-2 mt-0" />
      )}
      </div>

      {/* Custom CSS for Swiper */}
      <style jsx global>{`
        .review-swiper-container {
          width: 100%;
          padding: 20px 0 60px 0;
        }

        .review-swiper-container .swiper-slide {
          text-align: left;
          background: transparent;
          display: flex;
          justify-content: center;
          align-items: stretch;
        }

        /* Navigation Arrows */
        .review-swiper-button-prev,
        .review-swiper-button-next {
          position: absolute;
          top: 42%;
          background: transparent;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #757575;
          z-index: 10;
          cursor: pointer;
        }

        .review-swiper-button-prev:hover,
        .review-swiper-button-next:hover {
          background: transparent;
        }

        .review-swiper-button-prev {
          left: 16px;
        }

        .review-swiper-button-next {
          right: 16px;
        }

        .review-swiper-button-prev::after,
        .review-swiper-button-next::after {
          display: none;
        }

        /* Pagination Dots */
        .review-swiper-pagination {
          position: relative;
          display: flex;
          gap: 1px;
          z-index: 10;
        }

        .review-swiper-pagination .swiper-pagination-bullet {
          width: 12px;
          height: 12px;
          background: #D9D9D9;
          border-radius: 50%;
          opacity: 1;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .review-swiper-pagination .swiper-pagination-bullet:hover {
          background: #454850;
          transform: scale(1.2);
        }

        .review-swiper-pagination .swiper-pagination-bullet-active {
          background: #454850;
          transform: scale(1.2);
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .review-swiper-container {
            padding: 10px 0 50px 0;
          }
          
          .review-swiper-button-prev,
          .review-swiper-button-next {
            width: 36px;
            height: 36px;
          }
          
          .review-swiper-button-prev {
            left: 8px;
          }
          
          .review-swiper-button-next {
            right: 8px;
          }
          
          .review-swiper-pagination {
            margin-top: 6px;
          }
          
          .review-swiper-pagination .swiper-pagination-bullet {
            width: 6px;
            height: 6px;
          }
        }

        /* Focus states for accessibility */
        .review-swiper-button-prev:focus,
        .review-swiper-button-next:focus,
        .review-swiper-pagination .swiper-pagination-bullet:focus {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }

        /* Disabled states */
        .review-swiper-button-prev.swiper-button-disabled,
        .review-swiper-button-next.swiper-button-disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .review-swiper-button-prev.swiper-button-disabled:hover,
        .review-swiper-button-next.swiper-button-disabled:hover {
          transform: translateY(-50%) scale(1);
          background: #374151;
        }
      `}</style>
    </div>
  );
}
