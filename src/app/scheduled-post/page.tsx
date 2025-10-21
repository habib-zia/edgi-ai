
"use client";
import ScheduledPostsGrid from "@/components/scheduled-post/ScheduledPostsGrid";
import React from "react";

export default function ScheduledPostPage() {
    return (
        <div className="w-full bg-white/90 py-14 px-2 md:px-8">
            <div className="max-w-[1260px] w-full mx-auto">
                {/* Scheduled Posts Section */}
                <ScheduledPostsGrid />
            </div>
        </div>
    );
}