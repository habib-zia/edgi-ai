import { getApiUrl, getAuthHeaders, getAuthenticatedHeaders, ensureTokenStored, API_CONFIG, getHeyGenApiUrl, getHeyGenHeaders, postHeyGenHeaders } from './config';
// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  status?: number;
}

// Auth Types
export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface UserData {
  id: string;           
  email: string;
  firstName: string;
  lastName: string;
  phone: string;        
  isEmailVerified: boolean;
  googleId?: string;    
}

export interface UserResponse {
  success: boolean;
  data: {
    user: UserData;
  };
}

export interface AuthResponse {
  accessToken: string;
  user: UserData;
  isNewUser?: boolean;  
}

// Video Types
export interface VideoData {
  id: string;
  videoId: string;
  title: string;
  status: 'processing' | 'ready' | 'failed';
  createdAt: string;
  updatedAt: string;
  metadata?: {
    duration?: number;
    size?: number;
    format?: string;
  };
  downloadUrl?: string;
}

export interface VideoGalleryResponse {
  videos: VideoData[];
  totalCount: number;
  readyCount: number;
  processingCount: number;
  failedCount: number;
}

// Pending Workflow Types
export interface PendingWorkflow {
  _id: string;
  executionId: string;
  userId: string;
  email: string;
  status: 'processing' | 'pending' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
  title?: string;
}

export interface PendingWorkflowsResponse {
  workflows: PendingWorkflow[];
  count: number;
}

// Avatar Types
export interface Avatar {
  _id: string;
  avatar_id: string;
  avatar_name: string;
  name?: string; 
  preview_image_url?: string;
  preview_video_url?: string;
  imageUrl?: string; 
  userId?: string;
  default?: boolean;
  status: string;
  gender?: string;
  ethnicity?: string;
  age_group?: string;
  createdAt?: string;
  updatedAt?: string;
  avatarType?: 'video_avatar' | 'photo_avatar';
}

export interface AvatarsResponse {
  success: boolean;
  custom: Avatar[];
  default: Avatar[];
}

// Photo Avatar Types
export interface CreatePhotoAvatarRequest {
  image: File;
  age_group: string;
  name: string;
  gender: string;
  userId: string;
  ethnicity: string;
}

export interface CreatePhotoAvatarResponse {
  success: boolean;
  message: string;
}

// Video Avatar Types
export interface CreateVideoAvatarRequest {
  training_footage_url: string;
  video_consent_url: string;
  avatar_name: string;
  avatar_group_id?: string;
  callback_id?: string;
  callback_url?: string;
}

export interface CreateVideoAvatarResponse {
  avatar_id: string;
  avatar_group_id: string;
}

// Voice Avatar Types
export interface CreateVoiceAvatarRequest {
  audio: File;
  name: string;
  description: string;
  gender: string;
  language: string;
  userId: string;
}

export interface CreateVoiceAvatarResponse {
  success: boolean;
  message: string;
}

export interface VideoAvatarStatusResponse {
  avatar_id: string;
  status: 'in_progress' | 'completed' | 'failed';
  avatar_group_id: string;
  error?: string;
}

// Trends Types
export interface Trend {
  description: string;
  keypoints: string;
  postdescription: string;
}

export interface RealEstateTrendsData {
  topic: string;
  location: string;
  trends: Trend[];
  count: number;
}

export interface RealEstateTrendsResponse {
  success: boolean;
  message: string;
  data: RealEstateTrendsData;
}


// Payment Types
export interface PaymentIntentRequest {
  planId: string;
}

export interface SyncSubscriptionRequest {
  stripeSubscriptionId: string;
}

export interface PaymentIntentResponse {
  amount: number;
  currency: string;
  paymentIntent: {
    id: string;
    client_secret: string;
    amount: number;
    currency: string;
    status: string;
    [key: string]: any;
  };
}

export interface SubscriptionData {
  id: string;
  userId: string;
  planId: string;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  status: 'active' | 'inactive' | 'cancelled' | 'past_due' | 'pending';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  videoCount: number;
  videoLimit: number;
  createdAt: string;
  updatedAt: string;
}

export interface CurrentSubscriptionResponse {
  success: boolean;
  message: string;
  data: {
    subscription: SubscriptionData;
  };
}

// Billing History Types
export interface BillingTransaction {
  id: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  stripeInvoiceId: string;
  stripePaymentIntentId: string;
  subscriptionId: string;
  planId: string;
  createdAt: string;
  updatedAt: string;
  formattedAmount: string;
}

export interface BillingHistoryResponse {
  success: boolean;
  message: string;
  data: {
    transactions: BillingTransaction[];
    total: number;
    hasMore: boolean;
  };
}

// Payment Methods Types
export interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
  isExpired: boolean;
}

export interface PaymentMethodsResponse {
  success: boolean;
  message: string;
  data: {
    paymentMethods: PaymentMethod[];
  };
}

export interface SetupIntentResponse {
  success: boolean;
  message: string;
  data: {
    setupIntent: {
      id: string;
      client_secret: string;
    };
  };
}

export interface UpdatePaymentMethodRequest {
  setupIntentId: string;
  setAsDefault: boolean;
}

export interface UpdatePaymentMethodResponse {
  success: boolean;
  message: string;
  data: {
    paymentMethod: PaymentMethod;
  };
}


// API Service Class
class ApiService {
  // Global loading state management
  private globalLoadingCallback: ((loading: boolean, message?: string) => void) | null = null;
  
  // Global notification callback
  private notificationCallback: ((message: string, type?: 'success' | 'error' | 'warning' | 'info') => void) | null = null;

  setGlobalLoadingCallback(callback: (loading: boolean, message?: string) => void) {
    this.globalLoadingCallback = callback;
  }

  setNotificationCallback(callback: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void) {
    this.notificationCallback = callback;
  }

  private setGlobalLoading(loading: boolean, message?: string) {
    if (this.globalLoadingCallback) {
      this.globalLoadingCallback(loading, message);
    }
  }

  private showNotification(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'error') {
    if (this.notificationCallback) {
      this.notificationCallback(message, type);
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    requireAuth: boolean = false,
    timeout: number = 60000
  ): Promise<ApiResponse<T>> {
    const url = getApiUrl(endpoint);
    
    const headers = requireAuth 
      ? getAuthenticatedHeaders()
      : getAuthHeaders();

    const config: RequestInit = {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    };

    // Create an AbortController for timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        
        try {
          const errorData = JSON.parse(errorText);
          this.showNotification(errorData.message || 'An error occurred', 'error');
          return { 
            success: false, 
            message: errorData.message || 'An error occurred', 
            error: errorData.message,
            status: response.status 
          };
        } catch {
          this.showNotification(errorText || 'An unexpected error occurred', 'error');
          return { 
            success: false, 
            message: errorText || 'An unexpected error occurred', 
            error: errorText,
            status: response.status 
          };
        }
      }

      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      let errorMessage = 'An unexpected error occurred';
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Request timed out. Please try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      this.showNotification(errorMessage, 'error');
      return { success: false, message: errorMessage, error: errorMessage };
    }
  }


  // Authentication Methods
  async register(userData: RegisterData): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>(API_CONFIG.ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      body: JSON.stringify(userData),
    }, false);
  }

  async login(loginData: LoginData): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify(loginData),
    }, false);
  }

  async logout(): Promise<ApiResponse> {
    return this.request(API_CONFIG.ENDPOINTS.AUTH.LOGOUT, {
      method: 'POST',
    }, true);
  }

  async getCurrentUser(): Promise<ApiResponse<{ user: UserData }>> {
    return this.request<{ user: UserData }>(API_CONFIG.ENDPOINTS.AUTH.ME, {
      method: 'GET',
    }, true);
  }

  async updateProfile(profileData: Partial<UserData>): Promise<ApiResponse<{ user: UserData }>> {
    return this.request<{ user: UserData }>(API_CONFIG.ENDPOINTS.AUTH.PROFILE, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }, true);
  }

  async forgotPassword(email: string): Promise<ApiResponse> {
    return this.request(API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD, {
      method: 'POST',
      body: JSON.stringify({ email }),
    }, false);
  }

  async resetPassword(token: string, password: string): Promise<ApiResponse> {
    return this.request(API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD, {
      method: 'POST',
      body: JSON.stringify({ resetToken: token, newPassword: password }),
    }, false);
  }

  async validateResetToken(token: string): Promise<ApiResponse<{ isValid: boolean }>> {
    return this.request<{ isValid: boolean }>(API_CONFIG.ENDPOINTS.AUTH.VALIDATE_TOKEN, {
      method: 'POST',
      body: JSON.stringify({ token }),
    }, false);
  }

  async verifyEmail(token: string): Promise<ApiResponse> {
    return this.request(`${API_CONFIG.ENDPOINTS.AUTH.VERIFY_EMAIL}?token=${token}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async googleLogin(googleData: {
    googleId: string;
    email: string;
    firstName: string;
    lastName: string;
  }): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>(API_CONFIG.ENDPOINTS.AUTH.GOOGLE_LOGIN, {
      method: 'POST',
      body: JSON.stringify(googleData),
    }, false);
  }

  async resendVerification(email: string): Promise<ApiResponse> {
    return this.request(API_CONFIG.ENDPOINTS.AUTH.RESEND_VERIFICATION, {
      method: 'POST',
      body: JSON.stringify({ email }),
    }, false);
  }

  async getVideoGallery(): Promise<ApiResponse<{
    videos: any[];
    totalCount: number;
    readyCount: number;
    processingCount: number;
    failedCount: number;
  }>> {
    return this.request<{
      videos: any[];
      totalCount: number;
      readyCount: number;
      processingCount: number;
      failedCount: number;
    }>(API_CONFIG.ENDPOINTS.VIDEO.GALLERY, {
      method: 'GET',
    }, true);
  }

  async createVideo(videoData: any): Promise<ApiResponse<any>> {
    return this.request<any>(API_CONFIG.ENDPOINTS.VIDEO.CREATE, {
      method: 'POST',
      body: JSON.stringify(videoData),
    }, true, 600000); // 10 minutes timeout for video creation
  }

  async deleteVideo(videoId: string): Promise<ApiResponse> {
    return this.request(`${API_CONFIG.ENDPOINTS.VIDEO.DELETE}/${videoId}`, {
      method: 'DELETE',
    }, true);
  }

  async getVideoStatus(videoId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`${API_CONFIG.ENDPOINTS.VIDEO.STATUS}/${videoId}`, {
      method: 'GET',
    }, true);
  }

  async downloadVideo(videoId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`${API_CONFIG.ENDPOINTS.VIDEO.DOWNLOAD}/${videoId}`, {
      method: 'GET',
    }, true);
  }

  async downloadVideoFromUrl(videoUrl: string, userId: string, title: string): Promise<ApiResponse<any>> {
    return this.request<any>(API_CONFIG.ENDPOINTS.VIDEO.DOWNLOAD, {
      method: 'POST',
      body: JSON.stringify({
        videoUrl,
        userId,
        title
      }),
    }, true);
  }

  async generateVideo(videoData: any): Promise<ApiResponse<any>> {
    return this.request<any>(API_CONFIG.ENDPOINTS.VIDEO.GENERATE, {
      method: 'POST',
      body: JSON.stringify(videoData),
    }, true);
  }

  async checkEmail(email: string): Promise<ApiResponse<{ exists: boolean }>> {
    return this.request<{ exists: boolean }>(`${API_CONFIG.ENDPOINTS.AUTH.CHECK_EMAIL}?email=${encodeURIComponent(email)}`, {
      method: 'GET',
    }, false);
  }

  async checkEmailVerification(email: string): Promise<ApiResponse<{ isVerified: boolean }>> {
    return this.request<{ isVerified: boolean }>(API_CONFIG.ENDPOINTS.AUTH.CHECK_EMAIL_VERIFICATION, {
      method: 'POST',
      body: JSON.stringify({ email }),
    }, false);
  }

  // Avatar Methods
  async getAvatars(): Promise<ApiResponse<AvatarsResponse>> {
    try {
      const response = await this.request<AvatarsResponse>(API_CONFIG.ENDPOINTS.AVATAR.GET_AVATARS, {
        method: 'GET',
      }, true);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get avatars';
      this.showNotification(errorMessage, 'error');
      return { success: false, message: errorMessage, error: errorMessage };
    }
  }

  // Voices and Music Methods
  async getVoices(energyCategory?: string, gender?: string | null): Promise<ApiResponse<any>> {
    try {
      const params = new URLSearchParams()
      if (energyCategory) {
        params.append('energyCategory', energyCategory)
      }
      if (gender) {
        params.append('gender', gender)
      }
      
      const queryString = params.toString()
      const url = queryString ? `/api/elevenlabs/voices?${queryString}` : '/api/elevenlabs/voices'
      
      const response = await this.request<any>(url, {
        method: 'GET',
      }, true)
      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get voices'
      this.showNotification(errorMessage, 'error')
      return { success: false, message: errorMessage, error: errorMessage }
    }
  }

  async getMusicTracks(energyCategory?: string, gender?: string | null): Promise<ApiResponse<any>> {
    try {
      const params = new URLSearchParams()
      if (energyCategory) {
        params.append('energyCategory', energyCategory)
      }
      if (gender) {
        params.append('gender', gender)
      }
      
      const queryString = params.toString()
      const url = queryString ? `/api/music/tracks?${queryString}` : '/api/music/tracks'
      
      const response = await this.request<any>(url, {
        method: 'GET',
      }, true)
      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get music tracks'
      this.showNotification(errorMessage, 'error')
      return { success: false, message: errorMessage, error: errorMessage }
    }
  }

  async textToSpeech(data: {
    voice_id: string
    hook: string
    body: string
    conclusion: string
    output_format?: string
  }): Promise<ApiResponse<any>> {
    try {
      const response = await this.request<any>('/api/elevenlabs/text-to-speech', {
        method: 'POST',
        body: JSON.stringify({
          voice_id: data.voice_id,
          hook: data.hook,
          body: data.body,
          conclusion: data.conclusion,
          output_format: data.output_format || 'mp3_44100_128'
        }),
      }, true)
      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate text-to-speech'
      this.showNotification(errorMessage, 'error')
      return { success: false, message: errorMessage, error: errorMessage }
    }
  }

  // Trends Methods
  async getCityTrends(city: string, position?: string): Promise<ApiResponse<RealEstateTrendsData>> {
    try {
      const requestBody: { city: string; position?: string } = { city };
      if (position && position.trim()) {
        requestBody.position = position.trim();
      }
      const response = await this.request<RealEstateTrendsData>(API_CONFIG.ENDPOINTS.TRENDS.CITY, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      }, true);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get city trends';
      this.showNotification(errorMessage, 'error');
      return { success: false, message: errorMessage, error: errorMessage };
    }
  }

  async getDescriptionKeypoints(description: string): Promise<ApiResponse<{ keypoints: string }>> {
    try {
      const response = await this.request<{ keypoints: string }>(API_CONFIG.ENDPOINTS.TRENDS.DESCRIPTION, {
        method: 'POST',
        body: JSON.stringify({ description }),
      }, true);
      console.log('Description Keypoints API Response:', JSON?.stringify(response))
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get description keypoints';
      this.showNotification(errorMessage, 'error');
      return { success: false, message: errorMessage, error: errorMessage };
    }
  }

  // Schedule Methods
  async getSchedule(): Promise<ApiResponse<any>> {
    try {
      const url = getApiUrl('/api/schedule');
      const headers = getAuthenticatedHeaders();
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        
        try {
          const errorData = JSON.parse(errorText);
        
          if (errorData.message === 'No active schedule found') {
            return { 
              success: false, 
              message: errorData.message, 
              error: errorData.message,
              status: response.status 
            };
          }
          
          this.showNotification(errorData.message || 'An error occurred', 'error');
          return { 
            success: false, 
            message: errorData.message || 'An error occurred', 
            error: errorData.message,
            status: response.status 
          };
        } catch {
          this.showNotification(errorText || 'An unexpected error occurred', 'error');
          return { 
            success: false, 
            message: errorText || 'An unexpected error occurred', 
            error: errorText,
            status: response.status 
          };
        }
      }

      const data = await response.json();
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get schedule data';
      this.showNotification(errorMessage, 'error');
      return { success: false, message: errorMessage, error: errorMessage };
    }
  }

  async getScheduledPosts(): Promise<ApiResponse<any>> {
    try {
      const url = getApiUrl('/api/schedule');
      const headers = getAuthenticatedHeaders();
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.message === 'No active schedule found') {
            return { 
              success: false, 
              message: errorData.message, 
              error: errorData.message,
              status: response.status 
            };
          }
          
          this.showNotification(errorData.message || 'An error occurred', 'error');
          return { 
            success: false, 
            message: errorData.message || 'An error occurred', 
            error: errorData.message,
            status: response.status 
          };
        } catch {
          this.showNotification(errorText || 'An unexpected error occurred', 'error');
          return { 
            success: false, 
            message: errorText || 'An unexpected error occurred', 
            error: errorText,
            status: response.status 
          };
        }
      }

      const data = await response.json();
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get scheduled posts';
      this.showNotification(errorMessage, 'error');
      return { success: false, message: errorMessage, error: errorMessage };
    }
  }

  async deleteSchedule(scheduleId: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.request<any>(`${API_CONFIG.ENDPOINTS.VIDEO_SCHEDULE.DELETE}/${scheduleId}`, {
        method: 'DELETE',
      }, true);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete schedule';
      this.showNotification(errorMessage, 'error');
      return { success: false, message: errorMessage, error: errorMessage };
    }
  }

  async deletePost(scheduleId: string, postId: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.request<any>(`${API_CONFIG.ENDPOINTS.VIDEO_SCHEDULE.DELETE_POST}/${scheduleId}/post/${postId}`, {
        method: 'DELETE',
      }, true);
      console.log('Delete Post API Response:', JSON?.stringify(response))
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete post';
      this.showNotification(errorMessage, 'error');
      return { success: false, message: errorMessage, error: errorMessage };
    }
  }

  async updatePost(scheduleId: string, postId: string, updateData: {
    description?: string;
    keypoints?: string;
    captions?: {
      instagram?: string;
      facebook?: string;
      linkedin?: string;
      twitter?: string;
      tiktok?: string;
      youtube?: string;
    };
    scheduledFor?: string;
  }): Promise<ApiResponse<any>> {
    try {
      console.log('Update Post API Request:', scheduleId, postId, updateData)
      const response = await this.request<any>(`${API_CONFIG.ENDPOINTS.VIDEO_SCHEDULE.UPDATE_POST}/${scheduleId}/post/${postId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      }, true);
      console.log('Update Post API Response:', JSON?.stringify(response))
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update post';
      this.showNotification(errorMessage, 'error');
      return { success: false, message: errorMessage, error: errorMessage };
    }
  }

  async updateScheduleConfig(scheduleId: string, configData: {
    frequency: string;
    days: string[];
    times: string[];
  }): Promise<ApiResponse<any>> {
    try {
      console.log('Update Schedule Config API Request:', scheduleId, configData);
      
      const requestBody: any = {
        newFrequency: configData.frequency
      };

      // Add preferredTime for daily frequency
      if (configData.frequency === 'daily' && configData.times.length > 0) {
        requestBody.preferredTime = configData.times[0]; // Use first time for daily
      }

      // Add preferredDays and preferredTime for thrice-a-week
      if (configData.frequency === 'thrice-a-week' || configData.frequency === 'three_week') {
        requestBody.newFrequency = 'thrice-a-week';
        requestBody.preferredDays = configData.days;
        requestBody.preferredTime = configData.times;
      }

      // Add preferredDays and preferredTime for twice-a-week
      if (configData.frequency === 'twice-a-week' || configData.frequency === 'twice_week') {
        requestBody.newFrequency = 'twice-a-week';
        requestBody.preferredDays = configData.days;
        requestBody.preferredTime = configData.times;
      }

      // Add preferredDays and preferredTime for once-a-week
      if (configData.frequency === 'once-a-week' || configData.frequency === 'once_week') {
        requestBody.newFrequency = 'once-a-week';
        requestBody.preferredDays = configData.days;
        requestBody.preferredTime = configData.times;
      }

      console.log('Transformed request body:', requestBody);

      const response = await this.request<any>(`/api/schedule/${scheduleId}/frequency`, {
        method: 'PUT',
        headers: {
          'x-timezone': 'America/New_York' // You can make this configurable
        },
        body: JSON.stringify(requestBody)
      }, true);
      console.log('Update Schedule Config API Response:', JSON?.stringify(response));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update schedule configuration';
      this.showNotification(errorMessage, 'error');
      return { success: false, message: errorMessage, error: errorMessage };
    }
  }
  async getPublishedPosts(): Promise<ApiResponse<any>> {
      try {
        const response = await this.request<any>('/api/socialbu/posts', {
          method: 'POST',
          body: JSON.stringify({ "type": "published" })
        }, true);
        return response;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to get published posts';
        // Note: Authentication errors are handled by ProtectedRoute, don't show notification here
        return { success: false, message: errorMessage, error: errorMessage };
      }
  }

  async getTopPostsInsights(startDate: string, endDate: string, postType: string = 'reel'): Promise<ApiResponse<any>> {
    try {
      const response = await this.request<any>('/api/socialbu/top/posts', {
        method: 'POST',
        body: JSON.stringify({
          start: startDate,
          end: endDate,
          metrics: "like_count,comments_count,impressions,reach,saved,plays,shares,total_interactions",
          post_type: postType
        })
      }, true);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get top posts insights';
      // Note: Authentication errors are handled by ProtectedRoute, don't show notification here
      return { success: false, message: errorMessage, error: errorMessage };
    }
  }
  

  async createPhotoAvatar(formData: FormData): Promise<ApiResponse<CreatePhotoAvatarResponse>> {
    try {
      console.log('🔧 API Service - createPhotoAvatar called')
      console.log('🔧 FormData contents:')
      for (const [key, value] of formData.entries()) {
        if (key === 'image' && value instanceof File) {
          console.log(`  ${key}:`, value, `(File: ${value.name}, Size: ${value.size} bytes, Type: ${value.type})`)
        } else {
          console.log(`  ${key}:`, value)
        }
      }
      console.log('🔧 Endpoint:', API_CONFIG.ENDPOINTS.AVATAR.CREATE_PHOTO_AVATAR)
      console.log('📡 WebSocket notifications will be sent to user room for real-time updates')
      
     
      const headers = getAuthenticatedHeaders();
      delete headers['Content-Type']; // Remove Content-Type to let browser set multipart boundary

      const url = getApiUrl(API_CONFIG.ENDPOINTS.AVATAR.CREATE_PHOTO_AVATAR);
      
    
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

   

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          this.showNotification(errorData.message || 'Failed to create photo avatar', 'error');
          return { success: false, message: errorData.message || 'Failed to create photo avatar', error: errorData.message };
        } catch {
          // If JSON parsing fails, show the raw error text
          this.showNotification(errorText || 'Failed to create photo avatar', 'error');
          return { success: false, message: errorText || 'Failed to create photo avatar', error: errorText };
        }
      }

      const result = await response.json();
   
      return result;
    } catch (error) {
   
      const errorMessage = error instanceof Error ? error.message : 'Failed to create photo avatar';
      this.showNotification(errorMessage, 'error');
      return { success: false, message: errorMessage, error: errorMessage };
    }
  }

  async createVideoAvatar(
    trainingVideoFile: File, 
    consentVideoFile: File, 
    avatarName: string
  ): Promise<ApiResponse<CreateVideoAvatarResponse>> {
    try {
      console.log('🎬 Starting video avatar creation process...')

      // Create FormData for multipart/form-data request
      const formData = new FormData();
      formData.append('avatar_name', avatarName);
      formData.append('training_footage', trainingVideoFile);
      formData.append('consent_statement', consentVideoFile);

      const url = getApiUrl(API_CONFIG.ENDPOINTS.VIDEO_AVATAR.CREATE);

      const headers = postHeyGenHeaders();

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          let errorMessage = 'Failed to create video avatar';
          
          // Handle nested error structure from HeyGen API
          if (errorData.error && errorData.error.message) {
            errorMessage = errorData.error.message;
          } else if (errorData.message) {
            // Extract the actual error message from the wrapped message
            // Format: "Heygen responded 400: {\"data\":null,\"error\":{\"code\":\"internal_error\",\"message\":\"You've reached the limit of 1 verified avatar group slots.\"}}"
            const messageMatch = errorData.message.match(/Heygen responded \d+: \{[^}]*"message":"([^"]*)"[^}]*\}/);
            if (messageMatch && messageMatch[1]) {
              errorMessage = messageMatch[1];
            } else {
              // Try to parse the JSON within the message
              try {
                const jsonMatch = errorData.message.match(/Heygen responded \d+: (.+)/);
                if (jsonMatch && jsonMatch[1]) {
                  const innerError = JSON.parse(jsonMatch[1]);
                  if (innerError.error && innerError.error.message) {
                    errorMessage = innerError.error.message;
                  } else {
                    errorMessage = errorData.message;
                  }
                } else {
                  errorMessage = errorData.message;
                }
              } catch {
                errorMessage = errorData.message;
              }
            }
          }
          
          this.showNotification(errorMessage, 'error');
          return { 
            success: false, 
            message: errorMessage, 
            error: errorMessage,
            status: response.status 
          };
        } catch {
          this.showNotification(errorText || 'Failed to create video avatar', 'error');
          return { 
            success: false, 
            message: errorText || 'Failed to create video avatar', 
            error: errorText,
            status: response.status 
          };
        }
      }

      const result = await response.json();
      console.log('✅ Video avatar creation initiated successfully:', result);
      
      // Show initial success notification
      this.showNotification('Video avatar creation started! You will receive real-time updates.', 'success');
      
      return {
        success: true,
        message: 'Video avatar creation started successfully',
        data: result
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create video avatar';
      console.error('❌ Error creating video avatar:', error);
      this.showNotification(errorMessage, 'error');
      return { success: false, message: errorMessage, error: errorMessage };
    }
  }

  async createVoiceAvatar(formData: FormData): Promise<ApiResponse<CreateVoiceAvatarResponse>> {
    try {
      const headers = getAuthenticatedHeaders();
      delete headers['Content-Type'];

      const url = getApiUrl(API_CONFIG.ENDPOINTS.ELEVENLABS.ADD_VOICE);
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          this.showNotification(errorData.message || 'Failed to create voice avatar', 'error');
          return { success: false, message: errorData.message || 'Failed to create voice avatar', error: errorData.message };
        } catch {
          this.showNotification(errorText || 'Failed to create voice avatar', 'error');
          return { success: false, message: errorText || 'Failed to create voice avatar', error: errorText };
        }
      }

      const result = await response.json();
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create voice avatar';
      this.showNotification(errorMessage, 'error');
      return { success: false, message: errorMessage, error: errorMessage };
    }
  }

  async getVideoAvatarStatus(id: string): Promise<ApiResponse<VideoAvatarStatusResponse>> {
    try {
      console.log('🔍 Checking video avatar status for ID:', id);
      
      const url = getApiUrl(`${API_CONFIG.ENDPOINTS.VIDEO_AVATAR.STATUS}/${id}`);
      const headers = getAuthenticatedHeaders();


      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          this.showNotification(errorData.message || 'Failed to get video avatar status', 'error');
          return { 
            success: false, 
            message: errorData.message || 'Failed to get video avatar status', 
            error: errorData.message,
            status: response.status 
          };
        } catch {
          this.showNotification(errorText || 'Failed to get video avatar status', 'error');
          return { 
            success: false, 
            message: errorText || 'Failed to get video avatar status', 
            error: errorText,
            status: response.status 
          };
        }
      }

      const result = await response.json();
      console.log('✅ Video avatar status retrieved:', result);
      
      return {
        success: true,
        message: 'Video avatar status retrieved successfully',
        data: result
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get video avatar status';
      console.error('❌ Error getting video avatar status:', error);
      this.showNotification(errorMessage, 'error');
      return { success: false, message: errorMessage, error: errorMessage };
    }
  }

  // Poll video avatar status until completion or failure
  async pollVideoAvatarStatus(
    avatarId: string, 
    onStatusUpdate?: (status: string, data: any) => void,
    maxAttempts: number = 60, // 5 minutes with 5-second intervals
    intervalMs: number = 5000
  ): Promise<ApiResponse<VideoAvatarStatusResponse>> {
    console.log('🔄 Starting status polling for avatar ID:', avatarId);
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`📊 Polling attempt ${attempt}/${maxAttempts}`);
        
        const statusResponse = await this.getVideoAvatarStatus(avatarId);
        
        if (!statusResponse.success) {
          console.error('❌ Status check failed:', statusResponse.message);
          return statusResponse;
        }

        const statusData = statusResponse.data;
        if (!statusData) {
          console.error('❌ No status data received');
          return {
            success: false,
            message: 'No status data received from server',
            error: 'No data'
          };
        }
        
        const status = statusData.status;
        
        console.log(`📈 Current status: ${status}`);
        
        // Notify about status update
        if (onStatusUpdate) {
          onStatusUpdate(status, statusData);
        }

        // Check if avatar generation is complete
        if (status === 'completed') {
          console.log('✅ Avatar generation completed successfully!');
          return statusResponse;
        }
        
        // Check if avatar generation failed
        if (status === 'failed') {
          console.error('❌ Avatar generation failed:', statusData.error);
          return {
            success: false,
            message: statusData.error || 'Avatar generation failed',
            error: statusData.error,
            data: statusData
          };
        }

        // If still in progress, wait before next attempt
        if (status === 'in_progress') {
          console.log(`⏳ Avatar still processing... waiting ${intervalMs}ms before next check`);
          await new Promise(resolve => setTimeout(resolve, intervalMs));
        }
        
      } catch (error) {
        console.error(`❌ Error in polling attempt ${attempt}:`, error);
        if (attempt === maxAttempts) {
          return {
            success: false,
            message: 'Failed to check avatar status after maximum attempts',
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      }
    }

    // If we reach here, we've exceeded max attempts
    console.warn('⚠️ Maximum polling attempts reached');
    return {
      success: false,
      message: 'Avatar generation is taking longer than expected. Please check back later.',
      error: 'Timeout'
    };
  }

  // Contact Form
  async sendContactMessage(messageData: {
    fullName: string;
    position?: string;
    email: string;
    phone?: string;
    subject: string;
    question: string;
  }): Promise<ApiResponse> {
    return this.request(API_CONFIG.ENDPOINTS.CONTACT, {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  // Health Check
  async healthCheck(): Promise<ApiResponse> {
    return this.request(API_CONFIG.ENDPOINTS.HEALTH, {
      method: 'GET',
    });
  }

  // Payment Methods - Using JWT auth
  async createPaymentIntent(planId: string): Promise<ApiResponse<PaymentIntentResponse>> {
    return this.request<PaymentIntentResponse>(API_CONFIG.ENDPOINTS.PAYMENT.PAYMENT_INTENT, {
      method: 'POST',
      body: JSON.stringify({ planId }),
    }, true);
  }

  // Subscription Methods
  async getPricingPlans(): Promise<ApiResponse<{ plans: any[] }>> {
    return this.request<{ plans: any[] }>(API_CONFIG.ENDPOINTS.SUBSCRIPTION.PLANS, {
      method: 'GET',
    }, false);
  }

  async getCurrentSubscription(): Promise<ApiResponse<{ subscription: SubscriptionData }>> {
    return this.request<{ subscription: SubscriptionData }>(API_CONFIG.ENDPOINTS.SUBSCRIPTION.CURRENT, {
      method: 'GET',
    }, true);
  }

  async getBillingHistory(): Promise<ApiResponse<{ transactions: BillingTransaction[]; total: number; hasMore: boolean }>> {
    return this.request<{ transactions: BillingTransaction[]; total: number; hasMore: boolean }>(API_CONFIG.ENDPOINTS.SUBSCRIPTION.BILLING_HISTORY, {
      method: 'GET',
    }, true);
  }

  async changeSubscriptionPlan(newPlanId: string): Promise<ApiResponse<any>> {
    return this.request<any>(API_CONFIG.ENDPOINTS.SUBSCRIPTION.CHANGE_PLAN, {
      method: 'POST',
      body: JSON.stringify({ newPlanId }),
    }, true);
  }

  async cancelSubscription(): Promise<ApiResponse<any>> {
    return this.request<any>(API_CONFIG.ENDPOINTS.SUBSCRIPTION.CANCEL, {
      method: 'POST',
    }, true);
  }

  async syncSubscriptionFromStripe(stripeSubscriptionId: string): Promise<ApiResponse<any>> {
    return this.request<any>(API_CONFIG.ENDPOINTS.SUBSCRIPTION.SYNC_FROM_STRIPE, {
      method: 'POST',
      body: JSON.stringify({ stripeSubscriptionId }),
    }, true);
  }

  // Payment Methods API
  async getPaymentMethods(): Promise<ApiResponse<{ paymentMethods: PaymentMethod[] }>> {
    return this.request<{ paymentMethods: PaymentMethod[] }>(API_CONFIG.ENDPOINTS.PAYMENT.METHODS, {
      method: 'GET',
    }, true);
  }

  async createSetupIntent(): Promise<ApiResponse<{ setupIntent: { id: string; client_secret: string } }>> {
    return this.request<{ setupIntent: { id: string; client_secret: string } }>(API_CONFIG.ENDPOINTS.PAYMENT.SETUP_INTENT, {
      method: 'POST',
    }, true);
  }

  async updatePaymentMethod(data: UpdatePaymentMethodRequest): Promise<ApiResponse<{ paymentMethod: PaymentMethod }>> {
    return this.request<{ paymentMethod: PaymentMethod }>(API_CONFIG.ENDPOINTS.PAYMENT.UPDATE, {
      method: 'POST',
      body: JSON.stringify(data),
    }, true);
  }

  async setDefaultPaymentMethod(cardId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`${API_CONFIG.ENDPOINTS.PAYMENT.SET_DEFAULT}/${cardId}/set-default`, {
      method: 'POST',
    }, true);
  }

  async deletePaymentMethod(cardId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`${API_CONFIG.ENDPOINTS.PAYMENT.DELETE}/${cardId}`, {
      method: 'DELETE',
    }, true);
  }

  // Critical operations that should use global loading
  async registerWithGlobalLoading(userData: RegisterData): Promise<ApiResponse<AuthResponse>> {
    this.setGlobalLoading(true, 'Creating your account...');
    try {
      const result = await this.register(userData);
      return result;
    } finally {
      this.setGlobalLoading(false);
    }
  }

  async loginWithGlobalLoading(loginData: LoginData): Promise<ApiResponse<AuthResponse>> {
    this.setGlobalLoading(true, 'Signing you in...');
    try {
      const result = await this.login(loginData);
      return result;
    } finally {
      this.setGlobalLoading(false);
    }
  }

  async resetPasswordWithGlobalLoading(token: string, password: string): Promise<ApiResponse> {
    this.setGlobalLoading(true, 'Resetting your password...');
    try {
      const result = await this.resetPassword(token, password);
      return result;
    } finally {
      this.setGlobalLoading(false);
    }
  }

  async createPaymentIntentWithGlobalLoading(planId: string): Promise<ApiResponse<PaymentIntentResponse>> {
    this.setGlobalLoading(true, 'Preparing payment...');
    try {
      const result = await this.createPaymentIntent(planId);
      return result;
    } finally {
      this.setGlobalLoading(false);
    }
  }

  async changeSubscriptionPlanWithGlobalLoading(newPlanId: string): Promise<ApiResponse<any>> {
    this.setGlobalLoading(true, 'Updating your subscription...');
    try {
      const result = await this.changeSubscriptionPlan(newPlanId);
      return result;
    } finally {
      this.setGlobalLoading(false);
    }
  }

  async cancelSubscriptionWithGlobalLoading(): Promise<ApiResponse<any>> {
    this.setGlobalLoading(true, 'Cancelling your subscription...');
    try {
      const result = await this.cancelSubscription();
      return result;
    } finally {
      this.setGlobalLoading(false);
    }
  }

  // Pending Workflows API - Returns pending workflows data from DB
  async checkPendingWorkflows(userId: string): Promise<ApiResponse<PendingWorkflowsResponse>> {
    try {
      // Ensure token is available before making request
      if (!ensureTokenStored()) {
        console.warn('Skipping pending workflows check - no token available');
        return {
          success: false,
          message: 'No token available',
        };
      }
      
      const url = getApiUrl(`${API_CONFIG.ENDPOINTS.VIDEO.PENDING_WORKFLOWS}/${userId}`);
      const headers = getAuthenticatedHeaders();
      
      // Use proper async/await with error handling
      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });
      
      if (!response.ok) {
        console.warn('Pending workflows check failed with status:', response.status);
        return {
          success: false,
          message: `Failed with status: ${response.status}`,
          status: response.status,
        };
      }
      
      const data = await response.json();
      if (data.success && data.data) {
        console.log('✅ Pending workflows checked successfully');
        console.log('📊 Pending workflows data:', data.data);
        return {
          success: true,
          message: 'Pending workflows checked successfully',
          data: data.data,
        };
      } else {
        console.warn('Pending workflows check returned unsuccessful response:', data.message);
        return {
          success: false,
          message: data.message || 'Unsuccessful response',
        };
      }
    } catch (error: any) {
      // Log error but don't throw to maintain fire-and-forget behavior
      console.error('Pending workflows check failed:', error);
      return {
        success: false,
        message: error.message || 'Failed to check pending workflows',
        error: error.message,
      };
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
