import { z } from 'zod'

export const userSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().regex(/^[6-9]\d{9}$/), // Indian mobile number format
  role: z.enum(['USER', 'CHEF', 'ADMIN']),
  addresses: z.array(z.object({
    id: z.string(),
    type: z.enum(['HOME', 'WORK', 'OTHER']),
    street: z.string(),
    landmark: z.string().optional(),
    city: z.string(),
    state: z.string(),
    pincode: z.string().regex(/^[1-9][0-9]{5}$/),
    isDefault: z.boolean().default(false),
    coordinates: z.object({
      latitude: z.number(),
      longitude: z.number(),
    }).optional(),
  })),
  preferences: z.object({
    isVegetarian: z.boolean().optional(),
    spicyLevel: z.enum(['mild', 'medium', 'hot']).optional(),
    allergies: z.array(z.string()).optional(),
    favoriteCuisines: z.array(z.string()).optional(),
  }).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const chefProfileSchema = z.object({
  id: z.string(),
  userId: z.string(),
  bio: z.string(),
  specialities: z.array(z.string()),
  cuisines: z.array(z.string()),
  fssaiLicense: z.string(),
  fssaiExpiryDate: z.date(),
  rating: z.number().min(0).max(5).optional(),
  totalOrders: z.number().default(0),
  isVerified: z.boolean().default(false),
  isActive: z.boolean().default(true),
  kitchenPhotos: z.array(z.string().url()),
  bankDetails: z.object({
    accountNumber: z.string(),
    ifscCode: z.string(),
    accountHolderName: z.string(),
  }),
  workingHours: z.array(z.object({
    day: z.enum(['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']),
    isOpen: z.boolean(),
    openTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    closeTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  })),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type User = z.infer<typeof userSchema>
export type ChefProfile = z.infer<typeof chefProfileSchema>

export const loginSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/),
  otp: z.string().length(6),
})

export const registerSchema = z.object({
  name: z.string().min(1),
  phone: z.string().regex(/^[6-9]\d{9}$/),
  email: z.string().email(),
  role: z.enum(['USER', 'CHEF']),
}) 