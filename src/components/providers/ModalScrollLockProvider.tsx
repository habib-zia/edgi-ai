'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface ModalScrollLockContextType {
  openModal: () => void
  closeModal: () => void
}

const ModalScrollLockContext = createContext<ModalScrollLockContextType | undefined>(undefined)

export function useModalScrollLock() {
  const context = useContext(ModalScrollLockContext)
  if (!context) {
    throw new Error('useModalScrollLock must be used within ModalScrollLockProvider')
  }
  return context
}

interface ModalScrollLockProviderProps {
  children: ReactNode
}

export function ModalScrollLockProvider({ children }: ModalScrollLockProviderProps) {
  const [openModalCount, setOpenModalCount] = useState(0)

  useEffect(() => {
    if (openModalCount > 0) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [openModalCount])

  const openModal = () => {
    setOpenModalCount(prev => prev + 1)
  }

  const closeModal = () => {
    setOpenModalCount(prev => Math.max(0, prev - 1))
  }

  return (
    <ModalScrollLockContext.Provider value={{ openModal, closeModal }}>
      {children}
    </ModalScrollLockContext.Provider>
  )
}

