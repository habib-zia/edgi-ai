export const ensureFilesArrayLength = (files: (File | null)[], length: number = 3): (File | null)[] => {
  const result = [...files]
  while (result.length < length) {
    result.push(null)
  }
  return result.slice(0, length)
}

export const updateFileInArray = (
  files: (File | null)[],
  index: number,
  file: File | null
): (File | null)[] => {
  const updated = [...files]
  updated[index] = file
  return ensureFilesArrayLength(updated)
}

export const formatFileSize = (bytes: number): string => {
  return (bytes / 1024 / 1024).toFixed(2) + ' MB'
}

export const getRecordedCount = (files: (File | null)[]): number => {
  return files.filter(f => f !== null).length
}

