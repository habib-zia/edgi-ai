// Backend API Configuration
export const API_CONFIG = {
  // Express Backend URL
  BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://13.60.180.94:4000',
  
  // https://backend-pi-ten-23.vercel.app
  // http://localhost:4000
  // http://192.168.1.72:4000
  // http://192.168.3.30:4000
  
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
      DOWNLOAD_PROXY: '/api/video/download-proxy',
      GENERATE: '/api/video/generate-video',
      CREATE_VIDEO: '/api/video/create',
    },
    
    // Avatar endpoints
    AVATAR: {
      GET_AVATARS: '/api/video/avatars',
      CREATE_PHOTO_AVATAR: '/api/video/photo-avatar',
    },


    
    // Webhook endpoints
    WEBHOOK: {
      VIDEO_COMPLETE: '/api/webhook/video-complete',
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
  }
  
  return headers;
};
