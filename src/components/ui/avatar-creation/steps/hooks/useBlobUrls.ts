import { useState, useEffect, useRef } from 'react'

export const useBlobUrls = (files: (File | null)[]) => {
  const [blobUrls, setBlobUrls] = useState<{ [key: number]: string }>({})
  const blobUrlRefs = useRef<{ [key: number]: string }>({})

  useEffect(() => {
    const newUrls: { [key: number]: string } = {}
    
    files.forEach((file, index) => {
      if (file !== null) {
        const existingUrl = blobUrlRefs.current[index]
        
        if (!existingUrl) {
          const url = URL.createObjectURL(file)
          blobUrlRefs.current[index] = url
          newUrls[index] = url
        } else {
          newUrls[index] = existingUrl
        }
      } else {
        if (blobUrlRefs.current[index]) {
          URL.revokeObjectURL(blobUrlRefs.current[index])
          delete blobUrlRefs.current[index]
        }
      }
    })
    
    setBlobUrls(newUrls)
  }, [files])

  useEffect(() => {
    const currentBlobUrls = blobUrlRefs.current
    return () => {
      Object.values(currentBlobUrls).forEach(url => {
        URL.revokeObjectURL(url)
      })
      blobUrlRefs.current = {}
    }
  }, [])

  const revokeBlobUrl = (index: number) => {
    if (blobUrlRefs.current[index]) {
      URL.revokeObjectURL(blobUrlRefs.current[index])
      delete blobUrlRefs.current[index]
      setBlobUrls(prev => {
        const updated = { ...prev }
        delete updated[index]
        return updated
      })
    }
  }

  return { blobUrls, revokeBlobUrl }
}

