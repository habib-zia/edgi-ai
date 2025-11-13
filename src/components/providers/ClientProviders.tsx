'use client'

import { Provider } from 'react-redux'
import { store } from '@/store'
import { ErrorBoundary } from '@/components/error-boundary'
import AuthInitializer from '@/components/features/auth/AuthInitializer'
import TokenValidator from '@/components/features/auth/TokenValidator'
import { useAuthErrorHandler } from '@/hooks/useAuthErrorHandler'
import { useDeploymentReload } from '@/hooks/useDeploymentReload'
import ApiServiceProvider from './ApiServiceProvider'
import { UnifiedSocketProvider } from './UnifiedSocketProvider'
import { ModalScrollLockProvider } from './ModalScrollLockProvider'

interface ClientProvidersProps {
  children: React.ReactNode
}

function ClientProvidersContent({ children }: ClientProvidersProps) {
  useAuthErrorHandler()
  useDeploymentReload()
  
  return (
    <>
      <AuthInitializer />
      <TokenValidator />
      {children}
    </>
  )
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <ModalScrollLockProvider>
          <ApiServiceProvider>
            <UnifiedSocketProvider>
              <ClientProvidersContent>
                {children}
              </ClientProvidersContent>
            </UnifiedSocketProvider>
          </ApiServiceProvider>
        </ModalScrollLockProvider>
      </Provider>
    </ErrorBoundary>
  )
}
