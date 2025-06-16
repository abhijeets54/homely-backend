import { z } from 'zod';

declare const orderItemSchema: z.ZodObject<{
    id: z.ZodString;
    foodItemId: z.ZodString;
    quantity: z.ZodNumber;
    price: z.ZodNumber;
    specialInstructions: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    price: number;
    foodItemId: string;
    quantity: number;
    id: string;
    specialInstructions?: string | undefined;
}, {
    price: number;
    foodItemId: string;
    quantity: number;
    id: string;
    specialInstructions?: string | undefined;
}>;
type OrderItem = z.infer<typeof orderItemSchema>;

declare const loginSchema: z.ZodObject<{
    phone: z.ZodString;
    otp: z.ZodString;
}, "strip", z.ZodTypeAny, {
    phone: string;
    otp: string;
}, {
    phone: string;
    otp: string;
}>;
declare const registerSchema: z.ZodObject<{
    name: z.ZodString;
    phone: z.ZodString;
    email: z.ZodString;
    role: z.ZodEnum<["USER", "CHEF"]>;
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    phone: string;
    role: "USER" | "CHEF";
}, {
    name: string;
    email: string;
    phone: string;
    role: "USER" | "CHEF";
}>;

declare const SUPPORTED_LANGUAGES: readonly ["en", "hi", "ta", "bn"];
type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];
declare const INDIAN_STATES: readonly ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"];
type IndianState = typeof INDIAN_STATES[number];
declare const INDIAN_CUISINES: readonly ["North Indian", "South Indian", "Bengali", "Gujarati", "Maharashtrian", "Rajasthani", "Punjabi", "Mughlai", "Hyderabadi", "Kerala", "Goan", "Kashmiri", "Awadhi", "Chettinad", "Malvani", "Bihari", "Assamese", "Konkani"];
type IndianCuisine = typeof INDIAN_CUISINES[number];
declare const userSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    phone: z.ZodString;
    role: z.ZodEnum<["USER", "CHEF", "ADMIN"]>;
    addresses: z.ZodArray<z.ZodObject<{
        street: z.ZodString;
        landmark: z.ZodOptional<z.ZodString>;
        city: z.ZodString;
        state: z.ZodString;
        pincode: z.ZodString;
        coordinates: z.ZodOptional<z.ZodObject<{
            latitude: z.ZodNumber;
            longitude: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            latitude: number;
            longitude: number;
        }, {
            latitude: number;
            longitude: number;
        }>>;
    }, "strip", z.ZodTypeAny, {
        street: string;
        city: string;
        state: string;
        pincode: string;
        landmark?: string | undefined;
        coordinates?: {
            latitude: number;
            longitude: number;
        } | undefined;
    }, {
        street: string;
        city: string;
        state: string;
        pincode: string;
        landmark?: string | undefined;
        coordinates?: {
            latitude: number;
            longitude: number;
        } | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    phone: string;
    role: "USER" | "CHEF" | "ADMIN";
    addresses: {
        street: string;
        city: string;
        state: string;
        pincode: string;
        landmark?: string | undefined;
        coordinates?: {
            latitude: number;
            longitude: number;
        } | undefined;
    }[];
}, {
    name: string;
    email: string;
    phone: string;
    role: "USER" | "CHEF" | "ADMIN";
    addresses: {
        street: string;
        city: string;
        state: string;
        pincode: string;
        landmark?: string | undefined;
        coordinates?: {
            latitude: number;
            longitude: number;
        } | undefined;
    }[];
}>;
type User = z.infer<typeof userSchema>;
declare const chefProfileSchema: z.ZodObject<{
    userId: z.ZodString;
    bio: z.ZodString;
    specialities: z.ZodArray<z.ZodString, "many">;
    cuisines: z.ZodArray<z.ZodString, "many">;
    fssaiLicense: z.ZodString;
    fssaiExpiryDate: z.ZodDate;
    rating: z.ZodDefault<z.ZodNumber>;
    totalOrders: z.ZodDefault<z.ZodNumber>;
    isVerified: z.ZodDefault<z.ZodBoolean>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    kitchenPhotos: z.ZodArray<z.ZodString, "many">;
    bankDetails: z.ZodObject<{
        accountNumber: z.ZodString;
        ifscCode: z.ZodString;
        accountHolderName: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        accountNumber: string;
        ifscCode: string;
        accountHolderName: string;
    }, {
        accountNumber: string;
        ifscCode: string;
        accountHolderName: string;
    }>;
    workingHours: z.ZodArray<z.ZodObject<{
        day: z.ZodEnum<["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"]>;
        isOpen: z.ZodDefault<z.ZodBoolean>;
        openTime: z.ZodString;
        closeTime: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        day: "SUNDAY" | "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY";
        isOpen: boolean;
        openTime: string;
        closeTime: string;
    }, {
        day: "SUNDAY" | "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY";
        openTime: string;
        closeTime: string;
        isOpen?: boolean | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    userId: string;
    bio: string;
    specialities: string[];
    cuisines: string[];
    fssaiLicense: string;
    fssaiExpiryDate: Date;
    rating: number;
    totalOrders: number;
    isVerified: boolean;
    isActive: boolean;
    kitchenPhotos: string[];
    bankDetails: {
        accountNumber: string;
        ifscCode: string;
        accountHolderName: string;
    };
    workingHours: {
        day: "SUNDAY" | "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY";
        isOpen: boolean;
        openTime: string;
        closeTime: string;
    }[];
}, {
    userId: string;
    bio: string;
    specialities: string[];
    cuisines: string[];
    fssaiLicense: string;
    fssaiExpiryDate: Date;
    kitchenPhotos: string[];
    bankDetails: {
        accountNumber: string;
        ifscCode: string;
        accountHolderName: string;
    };
    workingHours: {
        day: "SUNDAY" | "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY";
        openTime: string;
        closeTime: string;
        isOpen?: boolean | undefined;
    }[];
    rating?: number | undefined;
    totalOrders?: number | undefined;
    isVerified?: boolean | undefined;
    isActive?: boolean | undefined;
}>;
type ChefProfile = z.infer<typeof chefProfileSchema>;
declare const foodItemSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodString;
    price: z.ZodNumber;
    imageUrl: z.ZodString;
    chefId: z.ZodString;
    cuisine: z.ZodString;
    isVegetarian: z.ZodBoolean;
    isAvailable: z.ZodDefault<z.ZodBoolean>;
    preparationTime: z.ZodNumber;
    servingSize: z.ZodNumber;
    ingredients: z.ZodArray<z.ZodString, "many">;
    allergens: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    spicyLevel: z.ZodEnum<["mild", "medium", "hot"]>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    title: string;
    description: string;
    price: number;
    imageUrl: string;
    chefId: string;
    cuisine: string;
    isVegetarian: boolean;
    isAvailable: boolean;
    preparationTime: number;
    servingSize: number;
    ingredients: string[];
    allergens: string[];
    spicyLevel: "mild" | "medium" | "hot";
    tags: string[];
}, {
    title: string;
    description: string;
    price: number;
    imageUrl: string;
    chefId: string;
    cuisine: string;
    isVegetarian: boolean;
    preparationTime: number;
    servingSize: number;
    ingredients: string[];
    spicyLevel: "mild" | "medium" | "hot";
    isAvailable?: boolean | undefined;
    allergens?: string[] | undefined;
    tags?: string[] | undefined;
}>;
type FoodItem = z.infer<typeof foodItemSchema>;
declare const orderSchema: z.ZodObject<{
    userId: z.ZodString;
    items: z.ZodArray<z.ZodObject<{
        foodItemId: z.ZodString;
        quantity: z.ZodNumber;
        price: z.ZodNumber;
        specialInstructions: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        price: number;
        foodItemId: string;
        quantity: number;
        specialInstructions?: string | undefined;
    }, {
        price: number;
        foodItemId: string;
        quantity: number;
        specialInstructions?: string | undefined;
    }>, "many">;
    totalAmount: z.ZodNumber;
    deliveryAddress: z.ZodObject<{
        street: z.ZodString;
        landmark: z.ZodOptional<z.ZodString>;
        city: z.ZodString;
        state: z.ZodString;
        pincode: z.ZodString;
        coordinates: z.ZodOptional<z.ZodObject<{
            latitude: z.ZodNumber;
            longitude: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            latitude: number;
            longitude: number;
        }, {
            latitude: number;
            longitude: number;
        }>>;
    }, "strip", z.ZodTypeAny, {
        street: string;
        city: string;
        state: string;
        pincode: string;
        landmark?: string | undefined;
        coordinates?: {
            latitude: number;
            longitude: number;
        } | undefined;
    }, {
        street: string;
        city: string;
        state: string;
        pincode: string;
        landmark?: string | undefined;
        coordinates?: {
            latitude: number;
            longitude: number;
        } | undefined;
    }>;
    paymentMethod: z.ZodEnum<["RAZORPAY", "COD"]>;
    paymentStatus: z.ZodDefault<z.ZodEnum<["PENDING", "PAID", "FAILED"]>>;
    orderStatus: z.ZodDefault<z.ZodEnum<["PLACED", "ACCEPTED", "PREPARING", "READY_FOR_PICKUP", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"]>>;
    estimatedDeliveryTime: z.ZodDate;
    actualDeliveryTime: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    userId: string;
    items: {
        price: number;
        foodItemId: string;
        quantity: number;
        specialInstructions?: string | undefined;
    }[];
    totalAmount: number;
    deliveryAddress: {
        street: string;
        city: string;
        state: string;
        pincode: string;
        landmark?: string | undefined;
        coordinates?: {
            latitude: number;
            longitude: number;
        } | undefined;
    };
    paymentMethod: "RAZORPAY" | "COD";
    paymentStatus: "PENDING" | "PAID" | "FAILED";
    orderStatus: "PLACED" | "ACCEPTED" | "PREPARING" | "READY_FOR_PICKUP" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED";
    estimatedDeliveryTime: Date;
    actualDeliveryTime?: Date | undefined;
}, {
    userId: string;
    items: {
        price: number;
        foodItemId: string;
        quantity: number;
        specialInstructions?: string | undefined;
    }[];
    totalAmount: number;
    deliveryAddress: {
        street: string;
        city: string;
        state: string;
        pincode: string;
        landmark?: string | undefined;
        coordinates?: {
            latitude: number;
            longitude: number;
        } | undefined;
    };
    paymentMethod: "RAZORPAY" | "COD";
    estimatedDeliveryTime: Date;
    paymentStatus?: "PENDING" | "PAID" | "FAILED" | undefined;
    orderStatus?: "PLACED" | "ACCEPTED" | "PREPARING" | "READY_FOR_PICKUP" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED" | undefined;
    actualDeliveryTime?: Date | undefined;
}>;
type Order = z.infer<typeof orderSchema>;

export { type ChefProfile, type FoodItem, INDIAN_CUISINES, INDIAN_STATES, type IndianCuisine, type IndianState, type Order, type OrderItem, SUPPORTED_LANGUAGES, type SupportedLanguage, type User, chefProfileSchema, foodItemSchema, loginSchema, orderItemSchema, orderSchema, registerSchema, userSchema };
