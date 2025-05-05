// src/index.ts
import { z as z3 } from "zod";

// src/schemas/food.ts
import { z } from "zod";
var foodItemSchema = z.object({
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
    totalOrders: z.number().default(0)
  }),
  cuisine: z.string(),
  isVegetarian: z.boolean(),
  isAvailable: z.boolean().default(true),
  preparationTime: z.number().min(0),
  // in minutes
  servingSize: z.number().positive(),
  ingredients: z.array(z.string()),
  allergens: z.array(z.string()).optional(),
  spicyLevel: z.enum(["mild", "medium", "hot"]),
  tags: z.array(z.string()).default([]),
  createdAt: z.date(),
  updatedAt: z.date()
});
var orderItemSchema = z.object({
  id: z.string(),
  foodItemId: z.string(),
  quantity: z.number().positive(),
  price: z.number().positive(),
  specialInstructions: z.string().optional()
});
var orderSchema = z.object({
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
      longitude: z.number()
    }).optional()
  }),
  paymentMethod: z.enum(["RAZORPAY", "COD"]),
  paymentStatus: z.enum(["PENDING", "PAID", "FAILED"]),
  orderStatus: z.enum([
    "PLACED",
    "ACCEPTED",
    "PREPARING",
    "READY_FOR_PICKUP",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED"
  ]),
  estimatedDeliveryTime: z.date(),
  actualDeliveryTime: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

// src/schemas/user.ts
import { z as z2 } from "zod";
var userSchema = z2.object({
  id: z2.string(),
  name: z2.string().min(1),
  email: z2.string().email(),
  phone: z2.string().regex(/^[6-9]\d{9}$/),
  // Indian mobile number format
  role: z2.enum(["USER", "CHEF", "ADMIN"]),
  addresses: z2.array(z2.object({
    id: z2.string(),
    type: z2.enum(["HOME", "WORK", "OTHER"]),
    street: z2.string(),
    landmark: z2.string().optional(),
    city: z2.string(),
    state: z2.string(),
    pincode: z2.string().regex(/^[1-9][0-9]{5}$/),
    isDefault: z2.boolean().default(false),
    coordinates: z2.object({
      latitude: z2.number(),
      longitude: z2.number()
    }).optional()
  })),
  preferences: z2.object({
    isVegetarian: z2.boolean().optional(),
    spicyLevel: z2.enum(["mild", "medium", "hot"]).optional(),
    allergies: z2.array(z2.string()).optional(),
    favoriteCuisines: z2.array(z2.string()).optional()
  }).optional(),
  createdAt: z2.date(),
  updatedAt: z2.date()
});
var chefProfileSchema = z2.object({
  id: z2.string(),
  userId: z2.string(),
  bio: z2.string(),
  specialities: z2.array(z2.string()),
  cuisines: z2.array(z2.string()),
  fssaiLicense: z2.string(),
  fssaiExpiryDate: z2.date(),
  rating: z2.number().min(0).max(5).optional(),
  totalOrders: z2.number().default(0),
  isVerified: z2.boolean().default(false),
  isActive: z2.boolean().default(true),
  kitchenPhotos: z2.array(z2.string().url()),
  bankDetails: z2.object({
    accountNumber: z2.string(),
    ifscCode: z2.string(),
    accountHolderName: z2.string()
  }),
  workingHours: z2.array(z2.object({
    day: z2.enum(["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"]),
    isOpen: z2.boolean(),
    openTime: z2.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    closeTime: z2.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
  })),
  createdAt: z2.date(),
  updatedAt: z2.date()
});
var loginSchema = z2.object({
  phone: z2.string().regex(/^[6-9]\d{9}$/),
  otp: z2.string().length(6)
});
var registerSchema = z2.object({
  name: z2.string().min(1),
  phone: z2.string().regex(/^[6-9]\d{9}$/),
  email: z2.string().email(),
  role: z2.enum(["USER", "CHEF"])
});

// src/index.ts
var SUPPORTED_LANGUAGES = ["en", "hi", "ta", "bn"];
var INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry"
];
var INDIAN_CUISINES = [
  "North Indian",
  "South Indian",
  "Bengali",
  "Gujarati",
  "Maharashtrian",
  "Rajasthani",
  "Punjabi",
  "Mughlai",
  "Hyderabadi",
  "Kerala",
  "Goan",
  "Kashmiri",
  "Awadhi",
  "Chettinad",
  "Malvani",
  "Bihari",
  "Assamese",
  "Konkani"
];
var userSchema2 = z3.object({
  name: z3.string().min(2),
  email: z3.string().email(),
  phone: z3.string().regex(/^\+?[1-9]\d{9,14}$/),
  role: z3.enum(["USER", "CHEF", "ADMIN"]),
  addresses: z3.array(
    z3.object({
      street: z3.string(),
      landmark: z3.string().optional(),
      city: z3.string(),
      state: z3.string(),
      pincode: z3.string().regex(/^[1-9][0-9]{5}$/),
      coordinates: z3.object({
        latitude: z3.number(),
        longitude: z3.number()
      }).optional()
    })
  )
});
var chefProfileSchema2 = z3.object({
  userId: z3.string(),
  bio: z3.string().min(10),
  specialities: z3.array(z3.string()),
  cuisines: z3.array(z3.string()),
  fssaiLicense: z3.string(),
  fssaiExpiryDate: z3.date(),
  rating: z3.number().min(0).max(5).default(0),
  totalOrders: z3.number().default(0),
  isVerified: z3.boolean().default(false),
  isActive: z3.boolean().default(true),
  kitchenPhotos: z3.array(z3.string()).min(1),
  bankDetails: z3.object({
    accountNumber: z3.string(),
    ifscCode: z3.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/),
    accountHolderName: z3.string()
  }),
  workingHours: z3.array(
    z3.object({
      day: z3.enum([
        "SUNDAY",
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY"
      ]),
      isOpen: z3.boolean().default(true),
      openTime: z3.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      closeTime: z3.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    })
  )
});
var foodItemSchema2 = z3.object({
  title: z3.string().min(3),
  description: z3.string().min(10),
  price: z3.number().min(0),
  imageUrl: z3.string().url(),
  chefId: z3.string(),
  cuisine: z3.string(),
  isVegetarian: z3.boolean(),
  isAvailable: z3.boolean().default(true),
  preparationTime: z3.number().min(0),
  servingSize: z3.number().min(1),
  ingredients: z3.array(z3.string()).min(1),
  allergens: z3.array(z3.string()).default([]),
  spicyLevel: z3.enum(["mild", "medium", "hot"]),
  tags: z3.array(z3.string()).default([])
});
var orderSchema2 = z3.object({
  userId: z3.string(),
  items: z3.array(
    z3.object({
      foodItemId: z3.string(),
      quantity: z3.number().min(1),
      price: z3.number().min(0),
      specialInstructions: z3.string().optional()
    })
  ).min(1),
  totalAmount: z3.number().min(0),
  deliveryAddress: z3.object({
    street: z3.string(),
    landmark: z3.string().optional(),
    city: z3.string(),
    state: z3.string(),
    pincode: z3.string().regex(/^[1-9][0-9]{5}$/),
    coordinates: z3.object({
      latitude: z3.number(),
      longitude: z3.number()
    }).optional()
  }),
  paymentMethod: z3.enum(["RAZORPAY", "COD"]),
  paymentStatus: z3.enum(["PENDING", "PAID", "FAILED"]).default("PENDING"),
  orderStatus: z3.enum([
    "PLACED",
    "ACCEPTED",
    "PREPARING",
    "READY_FOR_PICKUP",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED"
  ]).default("PLACED"),
  estimatedDeliveryTime: z3.date(),
  actualDeliveryTime: z3.date().optional()
});
export {
  INDIAN_CUISINES,
  INDIAN_STATES,
  SUPPORTED_LANGUAGES,
  chefProfileSchema2 as chefProfileSchema,
  foodItemSchema2 as foodItemSchema,
  loginSchema,
  orderItemSchema,
  orderSchema2 as orderSchema,
  registerSchema,
  userSchema2 as userSchema
};
//# sourceMappingURL=index.mjs.map