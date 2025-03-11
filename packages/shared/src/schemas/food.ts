import { z } from 'zod'

export const foodItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string().min(1),
  price: z.number().positive(),
  imageUrl: z.string().url(),
  chefId: z.string(),
  chef: z.object({
    id: z.string(),
    name: z.string(),
    rating: z.number().min(0).max(5).optional(),
    totalOrders: z.number().default(0),
  }),
  cuisine: z.string(),
  isVegetarian: z.boolean(),
  isAvailable: z.boolean().default(true),
  preparationTime: z.number().min(0), // in minutes
  servingSize: z.number().positive(),
  ingredients: z.array(z.string()),
  allergens: z.array(z.string()).optional(),
  spicyLevel: z.enum(['mild', 'medium', 'hot']),
  tags: z.array(z.string()).default([]),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const orderItemSchema = z.object({
  id: z.string(),
  foodItemId: z.string(),
  quantity: z.number().positive(),
  price: z.number().positive(),
  specialInstructions: z.string().optional(),
})

export const orderSchema = z.object({
  id: z.string(),
  userId: z.string(),
  items: z.array(orderItemSchema),
  totalAmount: z.number().positive(),
  deliveryAddress: z.object({
    street: z.string(),
    landmark: z.string().optional(),
    city: z.string(),
    state: z.string(),
    pincode: z.string().regex(/^[1-9][0-9]{5}$/),
    coordinates: z.object({
      latitude: z.number(),
      longitude: z.number(),
    }).optional(),
  }),
  paymentMethod: z.enum(['RAZORPAY', 'COD']),
  paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED']),
  orderStatus: z.enum([
    'PLACED',
    'ACCEPTED',
    'PREPARING',
    'READY_FOR_PICKUP',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
  ]),
  estimatedDeliveryTime: z.date(),
  actualDeliveryTime: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type FoodItem = z.infer<typeof foodItemSchema>
export type OrderItem = z.infer<typeof orderItemSchema>
export type Order = z.infer<typeof orderSchema> 