'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { validateAndHandleToken } from '@/lib/jwt-client';
import { apiService } from '@/lib/api-service';
import { useAppDispatch } from '@/store/hooks';
import { setUser } from '@/store/slices/userSlice';

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error)
      {
        setStatus('error');
        setMessage('Google authentication was cancelled or failed.');
        setTimeout(() => {
          router.push('/');
        }, 3000);
        return;
      }

      if (!code)
      {
        setStatus('error');
        setMessage('No authorization code received from Google.');
        setTimeout(() => {
          router.push('/');
        }, 3000);
        return;
      }

      try
      {
        // Exchange code for access token
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            code,
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
            client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
            redirect_uri: `${window.location.origin}/auth/google/callback`,
            grant_type: 'authorization_code',
          }),
        });

        if (!tokenResponse.ok)
        {
          throw new Error('Failed to exchange code for token');
        }

        const tokenData = await tokenResponse.json();

        // Get user info from Google
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
          },
        });

        if (!userInfoResponse.ok)
        {
          throw new Error('Failed to get user info from Google');
        }

        const userInfo = await userInfoResponse.json();

        // Call your backend API using apiService
        const data = await apiService.googleLogin({
          googleId: userInfo.id,
          email: userInfo.email,
          firstName: userInfo.given_name,
          lastName: userInfo.family_name,
        });

        if (data.success && data.data)
        {
          // Validate JWT token before storing
          const accessToken = data.data.accessToken;
          if (!validateAndHandleToken(accessToken))
          {
            setStatus('error');
            setMessage('Invalid token received. Please try again.');
            setTimeout(() => {
              router.push('/');
            }, 3000);
            return;
          }

          // Store the access token
          localStorage.setItem('accessToken', accessToken);
          
          // Dispatch Redux action to set user data
          dispatch(setUser({
            user: {
              id: data.data.user.id,
              email: data.data.user.email,
              firstName: data.data.user.firstName,
              lastName: data.data.user.lastName,
              phone: data.data.user.phone || '',
              isEmailVerified: data.data.user.isEmailVerified,
              googleId: data.data.user.googleId,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            accessToken: accessToken
          }));
          
          // Check pending workflows immediately after Google login (fire and forget)
          // Small delay to ensure token is stored
          setTimeout(() => {
            if (data.data?.user?.id) {
              apiService.checkPendingWorkflows(data.data.user.id);
            }
          }, 100);
          
          setStatus('success');
          setMessage('Google authentication successful! Redirecting...');

          // Redirect to home page
          setTimeout(() => {
            router.push('/');
          }, 2000);
        } else
        {
          setStatus('error');
          setMessage(data.message || 'Google login failed.');
          setTimeout(() => {
            router.push('/');
          }, 3000);
        }
      } catch (error)
      {
        console.error('Google callback error:', error);
        setStatus('error');
        setMessage('An error occurred during Google authentication.');
        setTimeout(() => {
          router.push('/');
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, router, dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Google Authentication
          </h2>
        </div>

        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {status === 'loading' && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Completing Google authentication...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Success!</h3>
              <p className="mt-2 text-sm text-gray-600">{message}</p>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Authentication Failed</h3>
              <p className="mt-2 text-sm text-gray-600">{message}</p>
              <button
                onClick={() => router.push('/')}
                className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Go to Home
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Google Authentication
          </h2>
        </div>

        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading authentication...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <GoogleCallbackContent />
    </Suspense>
  );
}
