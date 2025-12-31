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
  title: z.string()
    .min(2, 'Title must be at least 2 characters')
    .max(100, 'Title must be less than 100 characters'),
  propertyType: z.string().min(1, 'Please select a property type'),
  avatar: z.string().min(1, 'Please select an avatar'),
  gender: z.string().min(1, 'Please select a gender'),
  voice: z.string().min(1, 'Please select a voice'),
  music: z.string().optional(),
  city: z.string()
    .min(2, 'City must be at least 2 characters')
    .max(50, 'City must be less than 50 characters'),
  address: z.string()
    .min(5, 'Address must be at least 5 characters')
    .max(200, 'Address must be less than 200 characters'),
  price: z.string()
    .min(1, 'Price is required'),
  size: z.string()
    .min(1, 'Size is required')
    .regex(/^\d+(\.\d+)?$/, 'Size must be a number'),
  lotSize: z.string().optional().refine((val) => !val || /^\d+(\.\d+)?$/.test(val), { message: 'Lot size must be a number' }),
  bedroomCount: z.string()
    .min(1, 'Bedroom count is required')
    .regex(/^\d+$/, 'Bedroom count must be a number'),
  // livingRoomCount: z.string()
  //   .min(1, 'Living room count is required'),
  bathroomCount: z.string()
    .min(1, 'Restroom count is required')
    .regex(/^\d+$/, 'Restroom count must be a number'),
  socialHandles: z.string()
    .min(1, 'Social handles is required'),
  mainSellingPoints: z.string().optional(),
  preset: z.string().optional(),
  preferredTone: z.string()
    .min(2, 'Preferred tone must be at least 2 characters')
    .max(100, 'Preferred tone must be less than 100 characters'),
})

// Type inference from schema
export type ListingVideoFormData = z.infer<typeof listingVideoSchema>

// Form validation schema for MusicVideoForm
export const musicVideoSchema = z.object({
  title: z.string()
    .min(2, 'Title must be at least 2 characters')
    .max(200, 'Title must be less than 200 characters'),
  propertyType: z.string()
    .min(1, 'Property type is required'),
  price: z.string()
    .min(1, 'Price is required'),
  size: z.string()
    .min(1, 'Size is required')
    .regex(/^\d+$/, 'Size must be a number'),
  bedroomCount: z.string()
    .min(1, 'Bedroom count is required')
    .regex(/^\d+$/, 'Bedroom count must be a number'),
  washroomCount: z.string()
    .min(1, 'Restroom count is required')
    .regex(/^\d+$/, 'Restroom count must be a number'),
  socialHandles: z.string()
    .min(1, 'Social handles is required'),
  mainSellingPoints: z.string().optional(),
  city: z.string()
    .min(2, 'City must be at least 2 characters')
    .max(50, 'City must be less than 50 characters'),
  address: z.string()
    .min(5, 'Address must be at least 5 characters')
    .max(200, 'Address must be less than 200 characters'),
  music: z.string()
    .min(1, 'Please select music'),
})

// Type inference from schema
export type MusicVideoFormData = z.infer<typeof musicVideoSchema>
