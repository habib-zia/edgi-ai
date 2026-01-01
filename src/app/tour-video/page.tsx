"use client";

import ProtectedRoute from "@/components/features/auth/ProtectedRoute";
import Link from "next/link";

export default function TourVideoPage() {
  return (
    <ProtectedRoute>
      <div className="bg-white">
        <div className="max-w-[1440px] mx-auto xl:px-0 px-3 lg:py-20 py-10">
          <div className="text-center mb-8">
            <h1 className="text-[37px] md:text-4xl leading-[46px] md:leading-[48px] lg:!leading-[54px] lg:text-[42px] font-semibold text-[#171717] mb-4">
             Create Music Video & Video <br className="hidden md:block" /> Listing Effortlessly
            </h1>
            <p className="text-lg md:text-[20px] text-[#5F5F5F] max-w-3xl mx-auto leading-[24px]">
              Choose between Music Video or Video Listing to create custom AI videos for your real estate marketing. Just select your preferred type and we'll guide you through the process.
            </p>
          </div>

          <div className="flex justify-center md:mb-8 mb-4">
            <Link
              href="/create-video"
              className="inline-flex items-center md:max-w-[167px] max-w-full w-full justify-center gap-2 px-6 py-[9.4px] bg-transparent text-[#5046E5] rounded-full md:text-[20px] text-[18px] hover:bg-[#5046E5] hover:text-white border-2 border-[#5046E5] transition-all duration-300 font-semibold whitespace-nowrap"
            >
              Gallery
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/create-video/music-video"
              className="inline-flex cursor-pointer items-center justify-center px-[26.5px] py-[13.2px] text-base font-semibold bg-[#e64a46] text-white rounded-full transition-all !duration-300 hover:bg-transparent hover:text-[#e64a46] border-2 border-[#e64a46] w-full sm:w-auto"
            >
              Music Video
            </Link>
            
            <Link
              href="/create-video/listing"
              className="inline-flex cursor-pointer items-center justify-center px-[26.5px] py-[13.2px] text-base font-semibold bg-[#e64a46] text-white rounded-full transition-all !duration-300 hover:bg-transparent hover:text-[#e64a46] border-2 border-[#e64a46] w-full sm:w-auto"
            >
              Video Listing
            </Link>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}