"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  INDIAN_CUISINES: () => INDIAN_CUISINES,
  INDIAN_STATES: () => INDIAN_STATES,
  SUPPORTED_LANGUAGES: () => SUPPORTED_LANGUAGES,
  chefProfileSchema: () => chefProfileSchema2,
  foodItemSchema: () => foodItemSchema2,
  loginSchema: () => loginSchema,
  orderItemSchema: () => orderItemSchema,
  orderSchema: () => orderSchema2,
  registerSchema: () => registerSchema,
  userSchema: () => userSchema2
});
module.exports = __toCommonJS(index_exports);
var import_zod3 = require("zod");

// src/schemas/food.ts
var import_zod = require("zod");
var foodItemSchema = import_zod.z.object({
  id: import_zod.z.string(),
  title: import_zod.z.string().min(1),
  description: import_zod.z.string().min(1),
  price: import_zod.z.number().positive(),
  imageUrl: import_zod.z.string().url(),
  chefId: import_zod.z.string(),
  chef: import_zod.z.object({
    id: import_zod.z.string(),
    name: import_zod.z.string(),
    rating: import_zod.z.number().min(0).max(5).optional(),
    totalOrders: import_zod.z.number().default(0)
  }),
  cuisine: import_zod.z.string(),
  isVegetarian: import_zod.z.boolean(),
  isAvailable: import_zod.z.boolean().default(true),
  preparationTime: import_zod.z.number().min(0),
  // in minutes
  servingSize: import_zod.z.number().positive(),
  ingredients: import_zod.z.array(import_zod.z.string()),
  allergens: import_zod.z.array(import_zod.z.string()).optional(),
  spicyLevel: import_zod.z.enum(["mild", "medium", "hot"]),
  tags: import_zod.z.array(import_zod.z.string()).default([]),
  createdAt: import_zod.z.date(),
  updatedAt: import_zod.z.date()
});
var orderItemSchema = import_zod.z.object({
  id: import_zod.z.string(),
  foodItemId: import_zod.z.string(),
  quantity: import_zod.z.number().positive(),
  price: import_zod.z.number().positive(),
  specialInstructions: import_zod.z.string().optional()
});
var orderSchema = import_zod.z.object({
  id: import_zod.z.string(),
  userId: import_zod.z.string(),
  items: import_zod.z.array(orderItemSchema),
  totalAmount: import_zod.z.number().positive(),
  deliveryAddress: import_zod.z.object({
    street: import_zod.z.string(),
    landmark: import_zod.z.string().optional(),
    city: import_zod.z.string(),
    state: import_zod.z.string(),
    pincode: import_zod.z.string().regex(/^[1-9][0-9]{5}$/),
    coordinates: import_zod.z.object({
      latitude: import_zod.z.number(),
      longitude: import_zod.z.number()
    }).optional()
  }),
  paymentMethod: import_zod.z.enum(["RAZORPAY", "COD"]),
  paymentStatus: import_zod.z.enum(["PENDING", "PAID", "FAILED"]),
  orderStatus: import_zod.z.enum([
    "PLACED",
    "ACCEPTED",
    "PREPARING",
    "READY_FOR_PICKUP",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED"
  ]),
  estimatedDeliveryTime: import_zod.z.date(),
  actualDeliveryTime: import_zod.z.date().optional(),
  createdAt: import_zod.z.date(),
  updatedAt: import_zod.z.date()
});

// src/schemas/user.ts
var import_zod2 = require("zod");
var userSchema = import_zod2.z.object({
  id: import_zod2.z.string(),
  name: import_zod2.z.string().min(1),
  email: import_zod2.z.string().email(),
  phone: import_zod2.z.string().regex(/^[6-9]\d{9}$/),
  // Indian mobile number format
  role: import_zod2.z.enum(["USER", "CHEF", "ADMIN"]),
  addresses: import_zod2.z.array(import_zod2.z.object({
    id: import_zod2.z.string(),
    type: import_zod2.z.enum(["HOME", "WORK", "OTHER"]),
    street: import_zod2.z.string(),
    landmark: import_zod2.z.string().optional(),
    city: import_zod2.z.string(),
    state: import_zod2.z.string(),
    pincode: import_zod2.z.string().regex(/^[1-9][0-9]{5}$/),
    isDefault: import_zod2.z.boolean().default(false),
    coordinates: import_zod2.z.object({
      latitude: import_zod2.z.number(),
      longitude: import_zod2.z.number()
    }).optional()
  })),
  preferences: import_zod2.z.object({
    isVegetarian: import_zod2.z.boolean().optional(),
    spicyLevel: import_zod2.z.enum(["mild", "medium", "hot"]).optional(),
    allergies: import_zod2.z.array(import_zod2.z.string()).optional(),
    favoriteCuisines: import_zod2.z.array(import_zod2.z.string()).optional()
  }).optional(),
  createdAt: import_zod2.z.date(),
  updatedAt: import_zod2.z.date()
});
var chefProfileSchema = import_zod2.z.object({
  id: import_zod2.z.string(),
  userId: import_zod2.z.string(),
  bio: import_zod2.z.string(),
  specialities: import_zod2.z.array(import_zod2.z.string()),
  cuisines: import_zod2.z.array(import_zod2.z.string()),
  fssaiLicense: import_zod2.z.string(),
  fssaiExpiryDate: import_zod2.z.date(),
  rating: import_zod2.z.number().min(0).max(5).optional(),
  totalOrders: import_zod2.z.number().default(0),
  isVerified: import_zod2.z.boolean().default(false),
  isActive: import_zod2.z.boolean().default(true),
  kitchenPhotos: import_zod2.z.array(import_zod2.z.string().url()),
  bankDetails: import_zod2.z.object({
    accountNumber: import_zod2.z.string(),
    ifscCode: import_zod2.z.string(),
    accountHolderName: import_zod2.z.string()
  }),
  workingHours: import_zod2.z.array(import_zod2.z.object({
    day: import_zod2.z.enum(["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"]),
    isOpen: import_zod2.z.boolean(),
    openTime: import_zod2.z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    closeTime: import_zod2.z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
  })),
  createdAt: import_zod2.z.date(),
  updatedAt: import_zod2.z.date()
});
var loginSchema = import_zod2.z.object({
  phone: import_zod2.z.string().regex(/^[6-9]\d{9}$/),
  otp: import_zod2.z.string().length(6)
});
var registerSchema = import_zod2.z.object({
  name: import_zod2.z.string().min(1),
  phone: import_zod2.z.string().regex(/^[6-9]\d{9}$/),
  email: import_zod2.z.string().email(),
  role: import_zod2.z.enum(["USER", "CHEF"])
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
var userSchema2 = import_zod3.z.object({
  name: import_zod3.z.string().min(2),
  email: import_zod3.z.string().email(),
  phone: import_zod3.z.string().regex(/^\+?[1-9]\d{9,14}$/),
  role: import_zod3.z.enum(["USER", "CHEF", "ADMIN"]),
  addresses: import_zod3.z.array(
    import_zod3.z.object({
      street: import_zod3.z.string(),
      landmark: import_zod3.z.string().optional(),
      city: import_zod3.z.string(),
      state: import_zod3.z.string(),
      pincode: import_zod3.z.string().regex(/^[1-9][0-9]{5}$/),
      coordinates: import_zod3.z.object({
        latitude: import_zod3.z.number(),
        longitude: import_zod3.z.number()
      }).optional()
    })
  )
});
var chefProfileSchema2 = import_zod3.z.object({
  userId: import_zod3.z.string(),
  bio: import_zod3.z.string().min(10),
  specialities: import_zod3.z.array(import_zod3.z.string()),
  cuisines: import_zod3.z.array(import_zod3.z.string()),
  fssaiLicense: import_zod3.z.string(),
  fssaiExpiryDate: import_zod3.z.date(),
  rating: import_zod3.z.number().min(0).max(5).default(0),
  totalOrders: import_zod3.z.number().default(0),
  isVerified: import_zod3.z.boolean().default(false),
  isActive: import_zod3.z.boolean().default(true),
  kitchenPhotos: import_zod3.z.array(import_zod3.z.string()).min(1),
  bankDetails: import_zod3.z.object({
    accountNumber: import_zod3.z.string(),
    ifscCode: import_zod3.z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/),
    accountHolderName: import_zod3.z.string()
  }),
  workingHours: import_zod3.z.array(
    import_zod3.z.object({
      day: import_zod3.z.enum([
        "SUNDAY",
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY"
      ]),
      isOpen: import_zod3.z.boolean().default(true),
      openTime: import_zod3.z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      closeTime: import_zod3.z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    })
  )
});
var foodItemSchema2 = import_zod3.z.object({
  title: import_zod3.z.string().min(3),
  description: import_zod3.z.string().min(10),
  price: import_zod3.z.number().min(0),
  imageUrl: import_zod3.z.string().url(),
  chefId: import_zod3.z.string(),
  cuisine: import_zod3.z.string(),
  isVegetarian: import_zod3.z.boolean(),
  isAvailable: import_zod3.z.boolean().default(true),
  preparationTime: import_zod3.z.number().min(0),
  servingSize: import_zod3.z.number().min(1),
  ingredients: import_zod3.z.array(import_zod3.z.string()).min(1),
  allergens: import_zod3.z.array(import_zod3.z.string()).default([]),
  spicyLevel: import_zod3.z.enum(["mild", "medium", "hot"]),
  tags: import_zod3.z.array(import_zod3.z.string()).default([])
});
var orderSchema2 = import_zod3.z.object({
  userId: import_zod3.z.string(),
  items: import_zod3.z.array(
    import_zod3.z.object({
      foodItemId: import_zod3.z.string(),
      quantity: import_zod3.z.number().min(1),
      price: import_zod3.z.number().min(0),
      specialInstructions: import_zod3.z.string().optional()
    })
  ).min(1),
  totalAmount: import_zod3.z.number().min(0),
  deliveryAddress: import_zod3.z.object({
    street: import_zod3.z.string(),
    landmark: import_zod3.z.string().optional(),
    city: import_zod3.z.string(),
    state: import_zod3.z.string(),
    pincode: import_zod3.z.string().regex(/^[1-9][0-9]{5}$/),
    coordinates: import_zod3.z.object({
      latitude: import_zod3.z.number(),
      longitude: import_zod3.z.number()
    }).optional()
  }),
  paymentMethod: import_zod3.z.enum(["RAZORPAY", "COD"]),
  paymentStatus: import_zod3.z.enum(["PENDING", "PAID", "FAILED"]).default("PENDING"),
  orderStatus: import_zod3.z.enum([
    "PLACED",
    "ACCEPTED",
    "PREPARING",
    "READY_FOR_PICKUP",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED"
  ]).default("PLACED"),
  estimatedDeliveryTime: import_zod3.z.date(),
  actualDeliveryTime: import_zod3.z.date().optional()
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  INDIAN_CUISINES,
  INDIAN_STATES,
  SUPPORTED_LANGUAGES,
  chefProfileSchema,
  foodItemSchema,
  loginSchema,
  orderItemSchema,
  orderSchema,
  registerSchema,
  userSchema
});
//# sourceMappingURL=index.js.map