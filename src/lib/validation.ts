import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(3, "الاسم يجب أن يكون 3 أحرف على الأقل").max(80),
  email: z.string().trim().toLowerCase().email("البريد الإلكتروني غير صحيح"),
  password: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل").max(120),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  country: z.string().trim().max(60).optional().or(z.literal("")),
  city: z.string().trim().max(60).optional().or(z.literal("")),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("البريد الإلكتروني غير صحيح"),
  password: z.string().min(1, "أدخل كلمة المرور"),
});

export const bidSchema = z.object({
  amount: z.coerce.number().int("المبلغ يجب أن يكون رقمًا صحيحًا").positive("المبلغ غير صالح"),
});

export const profileSchema = z.object({
  name: z.string().trim().min(3, "الاسم قصير جدًا").max(80),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  country: z.string().trim().max(60).optional().or(z.literal("")),
  city: z.string().trim().max(60).optional().or(z.literal("")),
  company: z.string().trim().max(80).optional().or(z.literal("")),
  notifyEmail: z.boolean().optional(),
  notifySms: z.boolean().optional(),
  notifyOutbid: z.boolean().optional(),
  notifyAuctions: z.boolean().optional(),
});

export const passwordSchema = z.object({
  currentPassword: z.string().min(1, "أدخل كلمة المرور الحالية"),
  newPassword: z.string().min(8, "كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل").max(120),
});

const isoDate = z.string().trim().min(1, "التاريخ مطلوب");

export const vehicleSchema = z.object({
  lotNumber: z.string().trim().min(3, "رقم اللوت مطلوب").max(30),
  vin: z.string().trim().min(11, "رقم الهيكل يجب أن يكون 11 حرفًا على الأقل").max(20),
  make: z.string().trim().min(1, "الشركة المصنعة مطلوبة").max(40),
  model: z.string().trim().min(1, "الطراز مطلوب").max(60),
  trim: z.string().trim().max(60).optional().or(z.literal("")),
  year: z.coerce.number().int().min(1950).max(2030),
  mileage: z.coerce.number().int().min(0).max(2_000_000),
  fuelType: z.string().trim().min(1),
  transmission: z.string().trim().min(1),
  bodyType: z.string().trim().min(1),
  color: z.string().trim().min(1, "اللون مطلوب").max(30),
  condition: z.string().trim().min(1),
  runCondition: z.string().trim().min(1, "حالة التشغيل مطلوبة").max(120),
  damageType: z.string().trim().min(1),
  damageDescription: z.string().trim().min(3, "وصف الأضرار مطلوب").max(1200),
  keysPresent: z.coerce.boolean(),
  titleStatus: z.string().trim().min(1).max(60),
  seller: z.string().trim().max(80).optional().or(z.literal("")),
  retailValue: z.coerce.number().int().min(0),
  repairCost: z.coerce.number().int().min(0),
  images: z
    .array(
      z
        .string()
        .trim()
        .refine((value) => /^(https?:\/\/|\/)/.test(value), "رابط الصورة غير صالح"),
    )
    .min(1, "أضف صورة واحدة على الأقل"),
  locationCity: z.string().trim().min(1, "المدينة مطلوبة").max(80),
  locationCountry: z.string().trim().min(1).max(60),
  auctionId: z.coerce.number().int().positive().nullable().optional(),
  startingBid: z.coerce.number().int().min(0),
  reservePrice: z.coerce.number().int().min(0).nullable().optional(),
  minIncrement: z.coerce.number().int().min(1, "الحد الأدنى للزيادة مطلوب"),
  status: z.enum(["upcoming", "live", "sold", "ended"]),
  auctionStart: isoDate,
  auctionEnd: isoDate,
});

export const auctionSchema = z.object({
  name: z.string().trim().min(3, "اسم المزاد مطلوب").max(100),
  code: z.string().trim().min(2, "رمز المزاد مطلوب").max(20),
  location: z.string().trim().min(2, "الموقع مطلوب").max(80),
  country: z.string().trim().min(2).max(60),
  startsAt: isoDate,
  endsAt: isoDate,
  status: z.enum(["upcoming", "live", "ended"]),
  description: z.string().trim().max(600).optional().or(z.literal("")),
});

export const notificationSchema = z.object({
  userId: z.coerce.number().int().positive().nullable().optional(),
  title: z.string().trim().min(3, "العنوان مطلوب").max(120),
  body: z.string().trim().min(3, "نص الإشعار مطلوب").max(600),
  type: z.enum(["info", "bid", "win", "payment", "auction"]).default("info"),
  link: z.string().trim().max(200).optional().or(z.literal("")),
});

export const settingsSchema = z.object({
  buyerFeePercent: z.coerce.number().int().min(0).max(40),
  minBuyerFee: z.coerce.number().int().min(0),
  docFee: z.coerce.number().int().min(0),
  sellerCommissionPercent: z.coerce.number().int().min(0).max(40),
  defaultIncrement: z.coerce.number().int().min(1),
  paymentDueDays: z.coerce.number().int().min(1).max(60),
});
