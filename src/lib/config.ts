// Backend API Configuration
export const API_CONFIG = {
  // Express Backend URL - default to localhost for backend auth
  BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://192.168.3.49:4000',
  
  // Payment API URL
  PAYMENT_API_URL: process.env.NEXT_PUBLIC_PAYMENT_API_URL || 'http://192.168.3.49:4000',

  
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
      CSRF_TOKEN: '/api/auth/csrf-token',
    },
    
    // Video endpoints
    VIDEO: {
      GALLERY: '/api/video/gallery',
      CREATE: '/api/video/create',
      DOWNLOAD: '/api/video/download',
      STATUS: '/api/video/status',
      DELETE: '/api/video/delete',
      DOWNLOAD_PROXY: '/api/video/download-proxy',
    },
    
    // Webhook endpoints
    WEBHOOK: {
      VIDEO_COMPLETE: '/api/webhook/video-complete',
    },
    

    
    // Payment endpoints
    PAYMENT: {
      PAYMENT_INTENT: '/api/subscription/payment-intent',
      CONFIRM_PAYMENT: '/api/subscription/confirm-payment-intent',
    },
    
    // Other endpoints
    CONTACT: '/api/contact',
    HEALTH: '/health',
  },
  
  // CSRF Configuration
  CSRF: {
    HEADER_NAME: 'x-csrf-token',
  },
  
  // Authentication Configuration
  AUTH: {
    TOKEN_KEY: 'accessToken',
    REFRESH_TOKEN_KEY: 'refreshToken',
  },
  
  // Stripe Configuration
  STRIPE: {
    PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_51S0FwKB2p93NE0UDmno6UgFck98LzeVeFkxWZnJiXDMYKnSpy8WMFrS9fcjSC3G1tovRnMAfUCz24C6DMCxCSdZr00T0OcEjk5',
  },
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BACKEND_URL}${endpoint}`;
};

// Helper function to get payment API URL
export const getPaymentApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.PAYMENT_API_URL}${endpoint}`;
};

// Helper function to get auth headers
export const getAuthHeaders = (includeCSRF: boolean = false): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  // Add CSRF token if requested
  if (includeCSRF) {
    const csrfToken = localStorage.getItem('csrfToken');
    if (csrfToken) {
      headers[API_CONFIG.CSRF.HEADER_NAME] = csrfToken;
    }
  }
  
  return headers;
};

// Helper function to get authenticated headers
export const getAuthenticatedHeaders = (includeCSRF: boolean = false): Record<string, string> => {
  const headers = getAuthHeaders(includeCSRF);
  const token = localStorage.getItem(API_CONFIG.AUTH.TOKEN_KEY);
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};
