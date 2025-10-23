"use client";
import React, { useState, useEffect } from "react";
import ScheduledPostCard from "./ScheduledPostCard";
import UpdateScheduleModal from "../ui/update-schedule-modal";
import { useScheduledPosts } from "@/hooks/useScheduledPosts";
import { apiService } from "@/lib/api-service";
import { noActiveScheduleIcon } from "../report-analytics/PlatformIcon";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { FaTrash } from "react-icons/fa6";
import ScheduleDeleteModal from "../ui/schedule-delete-modal";
import { useSchedule } from "@/hooks/useSchedule";
import ToggleButton from "../ui/toggle-button";
import ManualScheduledPosts from "./ManualScheduledPosts";
import { useManualPosts } from "@/hooks/useManualPosts";

export default function ScheduledPostsGrid() {
  const [isModalOpen, setIsModalOpen] = useState(false);  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [scheduleType, setScheduleType] = useState('manual');

  const {
    scheduledPostsDurationData,
    scheduledPosts,
    scheduleId,
    loading,
    error,
    fetchScheduledPosts,
    refreshScheduledPosts
  } = useScheduledPosts();

  const { scheduleData, scheduleLoading, deleteSchedule } = useSchedule();
  const { posts: manualPosts } = useManualPosts();

  useEffect(() => {
    fetchScheduledPosts();
  }, [fetchScheduledPosts]);


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

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const currentScheduleId = scheduleId || scheduleData?.id;
      if (currentScheduleId) {
        const success = await deleteSchedule(currentScheduleId);
        if (success) {
          console.log('Schedule deleted successfully from ScheduledPostsGrid');
          await refreshScheduledPosts(); 
        }
      } else {
        console.error('No schedule ID found');
        if ((window as any).showNotification) {
          (window as any).showNotification({
            type: 'error',
            title: 'Delete Failed',
            message: 'No schedule found to delete',
            duration: 5000
          });
        }
      }
    } catch (error) {
      console.error('Error in handleDeleteConfirm:', error);
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
  };
  return (
    <div className={`${scheduledPosts.length > 0 ? 'mt-0' : 'mt-0'}`}>
        <>
          <div className="text-center">
            <h1 className="text-3xl md:text-[42px] font-semibold text-[#171717] mb-4">
                Scheduled Post
            </h1>
            <p className="text-xl text-[#5F5F5F] mb-6 mx-auto leading-[24px]">
            Your content is queued and will be <br /> published automatically at the set time
            </p>
          </div>
          <div className="flex justify-center mb-8">
            <ToggleButton
              options={[
                { value: 'auto', label: 'Auto Scheduled' },
                { value: 'manual', label: 'Published Soon' }
              ]}
              selectedValue={scheduleType}
              onChange={setScheduleType}
            />
          </div>
          
          <div className="bg-[#EF99431A] rounded-lg px-5 py-[10px] max-w-fit mx-auto mb-24">
            <p className="text-center text-[#EF9943] text-xl font-normal">
              Your content is lined up and will go live within the week
            </p>
          </div>
        </>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center justify-between w-full md:flex-row flex-col gap-4">
          <Link href="/report-analytics" className="flex group items-center gap-2 text-[#5046E5] rounded-full text-lg font-semibold w-fit"> <ArrowLeftIcon className="w-6 h-6 group-hover:-translate-x-1 transition-transform duration-300" /> Reports Analytics</Link>

          {scheduledPosts.length > 0 && (
            <button
              onClick={handleDeleteClick}
              className="flex items-center gap-2 px-4 py-[8px] border-2 border-[#FF3131] text-[#FF3131] bg-[#FF313110] rounded-full text-lg font-medium hover:bg-[#FF3131] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaTrash className="text-sm" />
              {scheduleLoading ? 'Loading...' : 'Schedule Delete'}
            </button>
          )}
        </div>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5046E5]"></div>
        </div>
      ) : error && scheduleType === 'auto' ? (
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
      ) : scheduledPosts.length === 0 && scheduleType === 'auto' ? (
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
      ) : scheduleType === 'auto' &&(
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
      {scheduleType === 'manual' && (
        <ManualScheduledPosts posts={manualPosts} />
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
      
      <ScheduleDeleteModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
