export const BRAND = {
  nameAr: "منارة",
  nameEn: "MANARA",
  fullAr: "منارة للمزادات",
  fullEn: "MANARA AUTO AUCTIONS",
  tagline: "منصة مزادات سيارات موثوقة حول العالم",
  phone: "+1 (800) 555-0142",
  email: "support@manara-auctions.example",
} as const;

export const MAKES = [
  "Toyota",
  "Honda",
  "Nissan",
  "Hyundai",
  "Kia",
  "Ford",
  "Chevrolet",
  "Dodge",
  "Jeep",
  "GMC",
  "BMW",
  "Mercedes-Benz",
  "Audi",
  "Lexus",
  "Tesla",
  "Mazda",
  "Volkswagen",
  "Land Rover",
] as const;

export const BODY_TYPES = [
  "سيدان",
  "SUV",
  "شاحنة صغيرة",
  "كوبيه",
  "هاتشباك",
  "فان",
] as const;

export const FUEL_TYPES = ["بنزين", "ديزل", "هجين", "كهربائي"] as const;

export const TRANSMISSIONS = ["أوتوماتيك", "يدوي"] as const;

export const CONDITIONS = [
  { value: "running", label: "يعمل" },
  { value: "starts", label: "يدور ولا يسير" },
  { value: "non-running", label: "لا يعمل" },
] as const;

export const DAMAGE_TYPES = [
  "أضرار أمامية",
  "أضرار خلفية",
  "أضرار جانبية",
  "أضرار مائية",
  "حريق",
  "سرقة / استرداد",
  "أضرار طبيعية",
  "بدون أضرار",
] as const;

export const COUNTRIES = [
  "الولايات المتحدة",
  "كندا",
  "الإمارات",
  "السعودية",
  "المملكة المتحدة",
  "ألمانيا",
] as const;

export const LOCATION_CITIES: Record<string, string[]> = {
  "الولايات المتحدة": ["دالاس - تكساس", "لوس أنجلوس - كاليفورنيا", "نيوجيرسي", "شيكاغو - إلينوي", "ميامي - فلوريدا", "أتلانتا - جورجيا"],
  كندا: ["تورونتو", "فانكوفر"],
  الإمارات: ["دبي", "الشارقة"],
  السعودية: ["الرياض", "جدة"],
  "المملكة المتحدة": ["لندن", "مانشستر"],
  ألمانيا: ["هامبورغ", "ميونخ"],
};

export const VEHICLE_STATUS_LABELS: Record<string, string> = {
  upcoming: "قادمة",
  live: "مباشر",
  sold: "مباعة",
  ended: "منتهية",
};

export const AUCTION_STATUS_LABELS: Record<string, string> = {
  upcoming: "قادمة",
  live: "مباشرة",
  ended: "منتهية",
};

export const INVOICE_STATUS_LABELS: Record<string, string> = {
  pending: "بانتظار الدفع",
  paid: "مدفوعة",
  overdue: "متأخرة",
  cancelled: "ملغاة",
};

export const SORT_OPTIONS = [
  { value: "ending", label: "الأقرب انتهاءً" },
  { value: "newest", label: "الأحدث إضافة" },
  { value: "price-asc", label: "السعر: من الأقل" },
  { value: "price-desc", label: "السعر: من الأعلى" },
  { value: "year-desc", label: "سنة الصنع: الأحدث" },
] as const;

export const PAGE_SIZE = 12;
