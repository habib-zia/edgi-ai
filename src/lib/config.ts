// Backend API Configuration
export const API_CONFIG = {
  // Express Backend URL
  BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'https://backend.edgeairealty.com',
  // BACKEND_URL: 'https://backend.edgeairealty.com',
  // BACKEND_URL: 'http://192.168.1.85:4000',
  // BACKEND_URL: 'https://4bbfdd263eef.ngrok-free.app',
  // BACKEND_URL: 'http://localhost:4000',
  // BACKEND_URL: 'http://192.168.3.36:4000',
  
  // HeyGen API Configuration
  HEYGEN_API_URL: 'https://api.heygen.com',
  HEYGEN_API_KEY: 'ZjNmMWU2YTE5MTAzNDQ5MWJhN2E0ZjNiZWQxN2MwOGQtMTcxNzQ0MDQ3Mw==',
  
  // https://backend-pi-ten-23.vercel.app
  // http://localhost:4000
  // http://192.168.1.72:4000
  // http://192.168.3.30:4000
  // http://13.60.180.94:4000
  // https://backend.edgeairealty.com
  
  // API Endpoints
  ENDPOINTS: {
    // Auth endpoints
    AUTH: {
      REGISTER: '/api/auth/register',
      LOGIN: '/api/auth/login',
      LOGOUT: '/api/auth/logout',
      ME: '/api/auth/me',
      PROFILE: '/api/auth/profile',
      FORGOT_PASSWORD: '/api/auth/forgot-password',
      RESET_PASSWORD: '/api/auth/reset-password',
      VERIFY_EMAIL: '/api/auth/verify-email',
      RESEND_VERIFICATION: '/api/auth/resend-verification',
      CHECK_EMAIL: '/api/auth/check-email',
      CHECK_EMAIL_VERIFICATION: '/api/auth/check-email-verification',
      VALIDATE_TOKEN: '/api/auth/validate-token',
      CLEAR_EXPIRED_TOKENS: '/api/auth/clear-expired-tokens',
      GOOGLE_LOGIN: '/api/auth/google',
    },
    
    // Video endpoints
    VIDEO: {
      GALLERY: '/api/video/gallery',
      CREATE: '/api/video/create',
      DOWNLOAD: '/api/video/download',
      STATUS: '/api/video/status',
      DELETE: '/api/video/delete',
      // DOWNLOAD_PROXY: '/api/video/download-proxy',
      GENERATE: '/api/video/generate-video',
      PENDING_WORKFLOWS: '/api/video/pending-workflows',
      USER_SETTINGS: '/api/video/user-settings',
      NOTE: '/api/video',
      CREATE_LISTING: '/api/listing-create-video',
      CREATE_MUSIC_VIDEO: '/api/tour-video',
      
      // CREATE_VIDEO: '/api/video/create',
    },
    // Music endpoints
    MUSIC: {
      UPLOAD_CUSTOM: '/api/music/upload-custom',
    },
    USER_SETTINGS: '/api/user-settings/user-settings',
    // Trends endpoints
    TRENDS: {
      CITY: '/api/trends/city',
      DESCRIPTION: '/api/trends/description',
    },
    
    // Avatar endpoints
    AVATAR: {
      GET_AVATARS: '/api/video/avatars',
      CREATE_PHOTO_AVATAR: '/api/video/photo-avatar',
      CREATE_VOICE_AVATAR: '/api/video/voice-avatar',
    },
    
    // ElevenLabs endpoints
    ELEVENLABS: {
      ADD_VOICE: '/api/elevenlabs/voices/add',
    },
    
    // Video Avatar endpoints (HeyGen API)
    VIDEO_AVATAR: {
      CREATE: '/api/v2/video_avatar',
      STATUS: '/v2/video_avatar', // Will be appended with /{id} in the method
    },

    // SocialBu endpoints
    SOCIALBU: {
      ACCOUNTS_PUBLIC: '/api/socialbu/accounts',
      ACCOUNT_DELETE: '/api/socialbu-account',
      ACCOUNTS_CONNECT: '/api/socialbu/accounts/connect',
      MEDIA_CREATE_POST: '/api/socialbu-media/create-post',
      POSTS_SCHEDULED: '/api/socialbu/posts/scheduled',
    },
    
    // Video Schedule endpoints
            VIDEO_SCHEDULE: {
              SCHEDULE: '/api/video-schedule/schedule',
              DELETE: '/api/schedule',
              DELETE_POST: '/api/schedule',
              UPDATE_POST: '/api/schedule',
              SCHEDULED_POSTS: '/api/schedule',
            },
    
    // Webhook endpoints
    WEBHOOK: {
      VIDEO_COMPLETE: '/api/webhook/video-complete',
      LISTING_PROPERTY_IMAGES: '/api/analyse-listing-image',
    },
    
    // Payment endpoints
    PAYMENT: {
      PAYMENT_INTENT: '/api/subscription/payment-intent',
      METHODS: '/api/payment-methods',
      SETUP_INTENT: '/api/payment-methods/setup-intent',
      UPDATE: '/api/payment-methods/update',
      SET_DEFAULT: '/api/payment-methods', // Base path for set-default
      DELETE: '/api/payment-methods',      // Base path for delete
    },
    
    // Subscription endpoints
    SUBSCRIPTION: {
      PLANS: '/api/subscription/plans',
      CURRENT: '/api/subscription/current',
      BILLING_HISTORY: '/api/subscription/billing-history',
      CHANGE_PLAN: '/api/subscription/change-plan',
      CANCEL: '/api/subscription/cancel',
      SYNC_FROM_STRIPE: '/api/subscription/sync-from-stripe',
    },
    
    // Other endpoints
    CONTACT: '/api/contact',
    HEALTH: '/health',
  },
  
  
  // Authentication Configuration
  AUTH: {
    TOKEN_KEY: 'accessToken',
    
  },
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BACKEND_URL}${endpoint}`;
};

// Helper function to get HeyGen API URL
export const getHeyGenApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.HEYGEN_API_URL}${endpoint}`;
};

// Helper function to get auth headers
export const getAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  return headers;
};

// Helper function to get authenticated headers
export const getAuthenticatedHeaders = (): Record<string, string> => {
  const headers = getAuthHeaders();
  const token = localStorage.getItem(API_CONFIG.AUTH.TOKEN_KEY);
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    console.warn('No access token found in localStorage');
  }
  
  // Automatically detect and add timezone header
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  headers['x-timezone'] = userTimezone;
  
  return headers;
};

// Helper function to ensure token is properly stored before making authenticated requests
export const ensureTokenStored = (): boolean => {
  const token = localStorage.getItem(API_CONFIG.AUTH.TOKEN_KEY);
  if (!token) {
    console.warn('No access token available for authenticated request');
    return false;
  }
  return true;
};

// Helper function to get HeyGen API headers
export const getHeyGenHeaders = (): Record<string, string> => {
  return {
    'x-api-key': API_CONFIG.HEYGEN_API_KEY,
    'Content-Type': 'application/json',
  };
};
export const postHeyGenHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'x-api-key': API_CONFIG.HEYGEN_API_KEY,
  };
  
  // Add Authorization token if available
  const token = localStorage.getItem(API_CONFIG.AUTH.TOKEN_KEY);
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};
 // Add HeyGen API key

  
