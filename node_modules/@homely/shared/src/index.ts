import { z } from 'zod'

export * from './schemas/food'
export * from './schemas/user'

export const SUPPORTED_LANGUAGES = ['en', 'hi', 'ta', 'bn'] as const
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number]

export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
] as const

export type IndianState = typeof INDIAN_STATES[number]

export const INDIAN_CUISINES = [
  'North Indian',
  'South Indian',
  'Bengali',
  'Gujarati',
  'Maharashtrian',
  'Rajasthani',
  'Punjabi',
  'Mughlai',
  'Hyderabadi',
  'Kerala',
  'Goan',
  'Kashmiri',
  'Awadhi',
  'Chettinad',
  'Malvani',
  'Bihari',
  'Assamese',
  'Konkani',
] as const

export type IndianCuisine = typeof INDIAN_CUISINES[number]

// User types and schemas
export const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/),
  role: z.enum(['USER', 'CHEF', 'ADMIN']),
  addresses: z.array(
    z.object({
      street: z.string(),
      landmark: z.string().optional(),
      city: z.string(),
      state: z.string(),
      pincode: z.string().regex(/^[1-9][0-9]{5}$/),
      coordinates: z
        .object({
          latitude: z.number(),
          longitude: z.number(),
        })
        .optional(),
    })
  ),
})

export type User = z.infer<typeof userSchema>

// Chef profile types and schemas
export const chefProfileSchema = z.object({
  userId: z.string(),
  bio: z.string().min(10),
  specialities: z.array(z.string()),
  cuisines: z.array(z.string()),
  fssaiLicense: z.string(),
  fssaiExpiryDate: z.date(),
  rating: z.number().min(0).max(5).default(0),
  totalOrders: z.number().default(0),
  isVerified: z.boolean().default(false),
  isActive: z.boolean().default(true),
  kitchenPhotos: z.array(z.string()).min(1),
  bankDetails: z.object({
    accountNumber: z.string(),
    ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/),
    accountHolderName: z.string(),
  }),
  workingHours: z.array(
    z.object({
      day: z.enum([
        'SUNDAY',
        'MONDAY',
        'TUESDAY',
        'WEDNESDAY',
        'THURSDAY',
        'FRIDAY',
        'SATURDAY',
      ]),
      isOpen: z.boolean().default(true),
      openTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      closeTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    })
  ),
})

export type ChefProfile = z.infer<typeof chefProfileSchema>

// Food item types and schemas
export const foodItemSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  price: z.number().min(0),
  imageUrl: z.string().url(),
  chefId: z.string(),
  cuisine: z.string(),
  isVegetarian: z.boolean(),
  isAvailable: z.boolean().default(true),
  preparationTime: z.number().min(0),
  servingSize: z.number().min(1),
  ingredients: z.array(z.string()).min(1),
  allergens: z.array(z.string()).default([]),
  spicyLevel: z.enum(['mild', 'medium', 'hot']),
  tags: z.array(z.string()).default([]),
})

export type FoodItem = z.infer<typeof foodItemSchema>

// Order types and schemas
export const orderSchema = z.object({
  userId: z.string(),
  items: z
    .array(
      z.object({
        foodItemId: z.string(),
        quantity: z.number().min(1),
        price: z.number().min(0),
        specialInstructions: z.string().optional(),
      })
    )
    .min(1),
  totalAmount: z.number().min(0),
  deliveryAddress: z.object({
    street: z.string(),
    landmark: z.string().optional(),
    city: z.string(),
    state: z.string(),
    pincode: z.string().regex(/^[1-9][0-9]{5}$/),
    coordinates: z
      .object({
        latitude: z.number(),
        longitude: z.number(),
      })
      .optional(),
  }),
  paymentMethod: z.enum(['RAZORPAY', 'COD']),
  paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED']).default('PENDING'),
  orderStatus: z
    .enum([
      'PLACED',
      'ACCEPTED',
      'PREPARING',
      'READY_FOR_PICKUP',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'CANCELLED',
    ])
    .default('PLACED'),
  estimatedDeliveryTime: z.date(),
  actualDeliveryTime: z.date().optional(),
})

export type Order = z.infer<typeof orderSchema> 