
"use client";
import ScheduledPostsGrid from "@/components/scheduled-post/ScheduledPostsGrid";
import React from "react";

export default function ScheduledPostPage() {
    return (
        <div className="w-full bg-white/90 py-14 px-2 md:px-8">
            <div className="max-w-[1260px] w-full mx-auto">
                {/* Header Section */}
                <div className="text-center mb-20">
                    <h1 className="text-3xl md:text-[42px] font-semibold text-[#171717] mb-4">
                        Scheduled Post
                    </h1>
                    <p className="text-xl text-[#5F5F5F] mb-6 mx-auto leading-[24px]">
                    Your content is queued and will be <br /> published automatically at the set time
                    </p>
                    
                    {/* Information Banner */}
                    <div className="bg-[#EF99431A] rounded-lg px-5 py-[10px] max-w-fit mx-auto">
                        <p className="text-center text-[#EF9943] text-xl font-normal">
                            Your content is lined up and will go live within the week
                        </p>
                    </div>
                </div>

                {/* Scheduled Posts Section */}
                <ScheduledPostsGrid />
            </div>
        </div>
    );
}