import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface VideoRequest {
  requestId: string;
  prompt: string;
  avatar: string;
  name: string;
  position: string;
  companyName: string;
  license: string;
  tailoredFit: string;
  socialHandles: string;
  videoTopic: string;
  topicKeyPoints: string;
  city: string;
  preferredTone: string;
  callToAction: string;
  email: string;
  timestamp: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  webhookResponse?: any;
  videoUrl?: string;
  error?: string;
}

interface VideoState {
  currentVideo: VideoRequest | null;
  videoHistory: VideoRequest[];
  videoTopic: string | null; // Add video topic to state
  isLoading: boolean;
  error: string | null;
}

const initialState: VideoState = {
  currentVideo: null,
  videoHistory: [],
  videoTopic: null,
  isLoading: false,
  error: null,
};

const videoSlice = createSlice({
  name: 'video',
  initialState,
  reducers: {
    setVideoLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },

    setVideoError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    clearVideoError: (state) => {
      state.error = null;
    },

    createVideoRequest: (state, action: PayloadAction<VideoRequest>) => {
      state.currentVideo = action.payload;
      state.videoHistory.unshift(action.payload);
      state.videoTopic = action.payload.videoTopic; // Save video topic to state
      state.isLoading = false;
      state.error = null;
    },

    updateVideoStatus: (state, action: PayloadAction<{
      requestId: string;
      status: VideoRequest['status'];
      videoUrl?: string;
      webhookResponse?: any;
      error?: string;
    }>) => {
      const { requestId, status, videoUrl, webhookResponse, error } = action.payload;
      
      // Update current video if it matches
      if (state.currentVideo?.requestId === requestId) {
        state.currentVideo.status = status;
        if (videoUrl) state.currentVideo.videoUrl = videoUrl;
        if (webhookResponse) state.currentVideo.webhookResponse = webhookResponse;
        if (error) state.currentVideo.error = error;
      }

      // Update in history
      const videoIndex = state.videoHistory.findIndex(v => v.requestId === requestId);
      if (videoIndex !== -1) {
        state.videoHistory[videoIndex].status = status;
        if (videoUrl) state.videoHistory[videoIndex].videoUrl = videoUrl;
        if (webhookResponse) state.videoHistory[videoIndex].webhookResponse = webhookResponse;
        if (error) state.videoHistory[videoIndex].error = error;
      }
    },

    clearCurrentVideo: (state) => {
      state.currentVideo = null;
    },

    clearVideoHistory: (state) => {
      state.videoHistory = [];
    },

    removeVideoFromHistory: (state, action: PayloadAction<string>) => {
      const requestId = action.payload;
      state.videoHistory = state.videoHistory.filter(v => v.requestId !== requestId);
      
      if (state.currentVideo?.requestId === requestId) {
        state.currentVideo = null;
      }
    }
  },
});

export const {
  setVideoLoading,
  setVideoError,
  clearVideoError,
  createVideoRequest,
  updateVideoStatus,
  clearCurrentVideo,
  clearVideoHistory,
  removeVideoFromHistory
} = videoSlice.actions;

export default videoSlice.reducer;
