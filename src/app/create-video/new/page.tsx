"use client";

import CreateVideoForm from "@/components/ui/create-video-form";
import ProtectedRoute from "@/components/features/auth/ProtectedRoute";
import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function NewVideoPage() {
  return (
    <ProtectedRoute>
      <div className="bg-white">
        <div className="max-w-[1260px] mx-auto xl:px-0 px-3 lg:py-20 py-10">
          <div className="text-center mb-8">
            <h1 className="text-[37px] md:text-4xl leading-[40px] lg:text-[42px] font-semibold text-[#171717] mb-4">
              Create Videos Effortlessly
            </h1>
            <p className="text-lg md:text-[20px] text-[#5F5F5F] max-w-3xl mx-auto leading-[24px]">
              Custom AI videos for agents & loan officers—just fill one form, <br className="hidden md:block" /> hit submit, and we handle the rest.
            </p>
          </div>

          <div className="flex justify-center mb-10">
            <Link
              href="/create-video"
              className="inline-flex items-center md:max-w-[167px] max-w-full w-full justify-center gap-2 px-6 py-[9.4px] bg-transparent text-[#5046E5] rounded-full md:text-[20px] text-[18px] hover:bg-[#5046E5] hover:text-white border-2 border-[#5046E5] transition-all duration-300 font-semibold whitespace-nowrap"
            >
              Gallery
            </Link>
          </div>

            {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-10">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-blue-700 text-base font-medium">
                Your video avatar review typically takes around 10 minutes. Once it&apos;s approved, you can start creating videos right away.
                </p>
              </div>
            </div>
          </div> */}
          <div className="pt-4">
            <CreateVideoForm />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
