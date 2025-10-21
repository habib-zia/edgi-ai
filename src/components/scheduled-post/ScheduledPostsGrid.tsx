"use client";
import React, { useState, useEffect } from "react";
import ScheduledPostCard from "./ScheduledPostCard";
import UpdateScheduleModal from "../ui/update-schedule-modal";
import { useScheduledPosts } from "@/hooks/useScheduledPosts";
import { apiService } from "@/lib/api-service";
import { noActiveScheduleIcon } from "../report-analytics/PlatformIcon";
import Link from "next/link";

export default function ScheduledPostsGrid() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    scheduledPostsDurationData,
    scheduledPosts,
    scheduleId,
    loading,
    error,
    fetchScheduledPosts,
    refreshScheduledPosts
  } = useScheduledPosts();

  useEffect(() => {
    fetchScheduledPosts();
  }, [fetchScheduledPosts]);

  const handleModifySchedule = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleScheduleUpdate = async (scheduleData: any) => {
    try {

      if (!scheduleId) {
        console.error('No schedule ID available');
        if ((window as any).showNotification) {
          (window as any).showNotification({
            type: 'error',
            title: 'Update Failed',
            message: 'No schedule ID found',
            duration: 5000
          });
        }
        return;
      }

      const apiFrequency = scheduleData.frequency === "Daily" ? "daily" :
        scheduleData.frequency === "Twice a Week" ? "twice-a-week" :
          scheduleData.frequency === "Once a Week" ? "weekly" :
            scheduleData.frequency === "Three Times a Week" ? "thrice-a-week" : "daily";

      const days = scheduleData.posts.map((post: any) => post.day).filter((day: string) => day);
      const times = scheduleData.posts.map((post: any) => post.time).filter((time: string) => time);

      const configData = {
        frequency: apiFrequency,
        days: days,
        times: times
      };

      console.log('configData', scheduleId)
      const response = await apiService.updateScheduleConfig(scheduleId, configData);

      if (response.success) {
        if ((window as any).showNotification) {
          (window as any).showNotification({
            type: 'success',
            title: 'Schedule Updated',
            message: 'Schedule configuration has been updated successfully!',
            duration: 5000
          });
        }

        await refreshScheduledPosts();
        setIsModalOpen(false);
      } else {
        if ((window as any).showNotification) {
          (window as any).showNotification({
            type: 'error',
            title: 'Update Failed',
            message: response.message || 'Failed to update schedule configuration',
            duration: 5000
          });
        }
      }
    } catch (error) {
      console.error('Error updating schedule:', error);
      if ((window as any).showNotification) {
        (window as any).showNotification({
          type: 'error',
          title: 'Network Error',
          message: 'Failed to update schedule. Please try again.',
          duration: 5000
        });
      }
    }
  };
  return (
    <div className={`${scheduledPosts.length > 0 ? 'mt-0' : 'mt-0'}`}>
      {scheduledPosts.length > 0 &&  (
        <>  
          {/* Scheduled Posts Header */}
          <div className="text-center">
            <h1 className="text-3xl md:text-[42px] font-semibold text-[#171717] mb-4">
                Scheduled Post
            </h1>
            <p className="text-xl text-[#5F5F5F] mb-6 mx-auto leading-[24px]">
            Your content is queued and will be <br /> published automatically at the set time
            </p>
          </div>
          <div className="bg-[#EF99431A] rounded-lg px-5 py-[10px] max-w-fit mx-auto mb-24">
            <p className="text-center text-[#EF9943] text-xl font-normal">
              Your content is lined up and will go live within the week
            </p>
          </div>
        </>
      )}
      {/* Section Header */}
      <div className="flex flex-col md:flex-row justify-end items-start md:items-center gap-4 mb-6">
        {/* {scheduledPosts.length > 0 && (
        <h2 className="text-2xl !font-semibold md:text-[40px] text-[#171717]">
          Scheduled Posts
        </h2>
        )} */}

        {/* Modify Schedule Button */}
        {scheduledPosts.length > 0 && <button
          onClick={handleModifySchedule}
          className="flex items-center gap-2 px-4 py-[8px] border-2 border-[#5046E5] text-[#5046E5] rounded-full text-xl font-semibold hover:bg-[#5046E5]
         hover:text-white transition-colors duration-300">
          <svg width="20" height="22" viewBox="0 0 20 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 0C15.523 0 20 4.477 20 10C20 15.523 15.523 20 10 20C4.477 20 0 15.523 0 10C0 4.477 4.477 0 10 0ZM10 2C7.87827 2 5.84344 2.84285 4.34315 4.34315C2.84285 5.84344 2 7.87827 2 10C2 12.1217 2.84285 14.1566 4.34315 15.6569C5.84344 17.1571 7.87827 18 10 18C12.1217 18 14.1566 17.1571 15.6569 15.6569C17.1571 14.1566 18 12.1217 18 10C18 7.87827 17.1571 5.84344 15.6569 4.34315C14.1566 2.84285 12.1217 2 10 2ZM10 4C10.2449 4.00003 10.4813 4.08996 10.6644 4.25272C10.8474 4.41547 10.9643 4.63975 10.993 4.883L11 5V9.586L13.707 12.293C13.8863 12.473 13.9905 12.7144 13.9982 12.9684C14.006 13.2223 13.9168 13.4697 13.7488 13.6603C13.5807 13.8508 13.3464 13.9703 13.0935 13.9944C12.8406 14.0185 12.588 13.9454 12.387 13.79L12.293 13.707L9.293 10.707C9.13758 10.5514 9.03776 10.349 9.009 10.131L9 10V5C9 4.73478 9.10536 4.48043 9.29289 4.29289C9.48043 4.10536 9.73478 4 10 4Z" fill="currentColor" />
          </svg>

          Modify Schedule
        </button>}
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5046E5]"></div>
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <div className="flex items-center justify-center mb-3">
            <div className="flex items-center justify-center bg-[#5046E533] rounded-full h-[96px] w-[96px]">
              {noActiveScheduleIcon}
            </div>
          </div>
          <p className="text-[#171717] mb-2 md:text-[42px] text-[30px] font-semibold tracking-[0%]">No Active Schedule Yet</p>
          <p className="text-[#5F5F5F] text-xl font-normal tracking-[0%] leading-[24px] max-w-[500px] mx-auto mb-7">Create and schedule your social media posts to be published automatically at your preferred times.</p>
          <Link href="/create-video/new" className="bg-[#5046E5] text-white px-4 py-[14.4px] rounded-full text-xl font-semibold leading-[24px] mx-auto w-full max-w-[210px] inline-flex items-center justify-center hover:bg-transparent hover:text-[#5046E5] border-2 border-[#5046E5] transition-all duration-300">Make a Video</Link>
        </div>
      ) : scheduledPosts.length === 0 ? (
          <div className="text-center py-20">
          <div className="flex items-center justify-center mb-3">
            <div className="flex items-center justify-center bg-[#5046E533] rounded-full h-[96px] w-[96px]">
              {noActiveScheduleIcon}
            </div>
          </div>
            <p className="text-[#171717] mb-2 md:text-[42px] text-[30px] font-semibold tracking-[0%]">No Active Schedule Yet</p>
            <p className="text-[#5F5F5F] text-xl font-normal tracking-[0%] leading-[24px] max-w-[500px] mx-auto mb-7">Create and schedule your social media posts to be published automatically at your preferred times.</p>
            <Link href="/create-video/new" className="bg-[#5046E5] text-white px-4 py-[14.4px] rounded-full text-xl font-semibold leading-[24px] mx-auto w-full max-w-[210px] inline-flex items-center justify-center hover:bg-transparent hover:text-[#5046E5] border-2 border-[#5046E5] transition-all duration-300">Make a Video</Link>
          </div>
      ) : (
        <>          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scheduledPosts.map((post) => (
              <ScheduledPostCard
                key={post.id}
                post={post}
                scheduleId={scheduleId || undefined}
                onPostDeleted={refreshScheduledPosts}
                onPostUpdated={refreshScheduledPosts}
              />
            ))}
          </div>
        </>
      )}
      <UpdateScheduleModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onUpdate={handleScheduleUpdate}
        existingScheduleData={scheduledPostsDurationData ? {
          frequency: scheduledPostsDurationData.scheduleInfo?.frequency || 'daily',
          schedule: {
            days: [],
            times: []
          },
          startDate: scheduledPostsDurationData.scheduleInfo?.startDate || new Date().toISOString()
        } : undefined}
      />
    </div>
  );
}
