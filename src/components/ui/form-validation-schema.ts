import { z } from 'zod'

// Form validation schema for CreateVideoForm
export const createVideoSchema = z.object({
  prompt: z.string().min(1),
  avatar: z.string().min(1, 'Please select an avatar'),
  name: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Full name can only contain letters and spaces'),
  position: z.string().min(1, 'Please select a position'),
  companyName: z.string()
    .min(2, 'Company name must be at least 2 characters')
    .max(100, 'Company name must be less than 100 characters'),
  license: z.string()
    .min(2, 'License must be at least 2 characters')
    .max(50, 'License must be less than 50 characters'),
  tailoredFit: z.string()
    .min(2, 'Tailored fit must be at least 2 characters')
    .max(200, 'Tailored fit must be less than 200 characters'),
  socialHandles: z.string()
    .min(2, 'Social handles must be at least 2 characters')
    .max(200, 'Social handles must be less than 200 characters'),
  videoTopic: z.string()
    .min(1, 'Please enter a valid topic or key points.')
    .max(100, 'Topic must be less than 100 characters'),
  topicKeyPoints: z.string()
    .min(2, 'Key points are required')
    .max(500, 'Key points must be less than 500 characters'),
  city: z.string()
    .min(2, 'City must be at least 2 characters')
    .max(50, 'City must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'City can only contain letters and spaces'),
  preferredTone: z.string()
    .min(2, 'Preferred tone must be at least 2 characters')
    .max(100, 'Preferred tone must be less than 100 characters'),
  callToAction: z.string()
    .min(2, 'Call to action must be at least 2 characters')
    .max(200, 'Call to action must be less than 200 characters'),
  email: z.string()
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters'),
  gender: z.string().min(1, 'Please select a gender'),
  preset: z.string().optional(),
  voice: z.string().optional(),
  music: z.string().optional(),
  language: z.string().optional(),
  videoCaption: z.string().min(1, 'Please select an option')
})

// Type inference from schema
export type CreateVideoFormData = z.infer<typeof createVideoSchema>

// Form validation schema for ListingVideoForm
export const listingVideoSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  propertyType: z.string().min(1, 'Please select a property type'),
  avatar: z.string().min(1, 'Please select an avatar'),
  gender: z.string().min(1, 'Please select a gender'),
  voice: z.string().optional(),
  music: z.string().optional(),
  city: z.string()
    .min(2, 'City must be at least 2 characters')
    .max(50, 'City must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'City can only contain letters and spaces'),
  address: z.string()
    .min(5, 'Address must be at least 5 characters')
    .max(200, 'Address must be less than 200 characters'),
  price: z.string().optional(),
  socialHandles: z.string().optional(),
  preset: z.string().optional(),
}).refine((data) => {
  // If gender is selected, voice is required
  if (data.gender && !data.voice) {
    return false
  }
  return true
}, {
  message: 'Please select a voice',
  path: ['voice']
}).refine((data) => {
  // If gender is selected, music is required
  if (data.gender && !data.music) {
    return false
  }
  return true
}, {
  message: 'Please select music',
  path: ['music']
})

// Type inference from schema
export type ListingVideoFormData = z.infer<typeof listingVideoSchema>
