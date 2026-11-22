import "server-only";

import { eq, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  auctions,
  bids,
  invoices,
  notifications,
  platformMeta,
  settings,
  users,
  vehicles,
  watchlist,
} from "@/db/schema";
import { hashPassword, makeBidderNumber } from "@/lib/auth";

const SEED_KEY = "seed_v2";

const slugOverrides: Record<number, string> = {
  38570: "lamborghini-car-speed-prestige-38570",
};

const px = (id: number) =>
  `https://images.pexels.com/photos/${id}/${slugOverrides[id] ?? `pexels-photo-${id}`}.jpeg?auto=compress&cs=tinysrgb&w=1200`;

const EXTERIOR = [17233277, 35252954, 13554818, 16350068, 4809794, 28522339, 16288341, 33929696, 13117521, 37916267].map(px);
const UTILITY = [12021863, 17710763, 33847630, 5182307, 30740123, 12021856, 29553428, 23247753, 7873720, 16209079].map(px);
const SPORT = [38570, 27582932, 17017141, 19240614, 20695256, 19076555, 35082884, 38136077, 39283335, 5543498].map(px);
const INTERIOR = [9513509, 241190, 17000848, 235063, 27692895, 14240060, 16636448, 29480333, 9604950, 32227365].map(px);
const DAMAGE = [33749906, 28443036, 1230677, 5351114, 18317252, 2265634, 29740423, 10034073].map(px);

type SeedVehicle = {
  lot: string;
  vin: string;
  make: string;
  model: string;
  trim: string;
  year: number;
  mileage: number;
  fuel: string;
  transmission: string;
  body: string;
  color: string;
  condition: string;
  runCondition: string;
  damage: string;
  damageDescription: string;
  retail: number;
  repair: number;
  start: number;
  increment: number;
  city: string;
  country: string;
  auctionIdx: number;
  endInHours: number;
  status: "live" | "upcoming" | "sold" | "ended";
  pool: "exterior" | "utility" | "sport";
  keys: boolean;
  title: string;
};

type Pool = "exterior" | "utility" | "sport";
const pools: Record<Pool, string[]> = { exterior: EXTERIOR, utility: UTILITY, sport: SPORT };

const seedVehicles: SeedVehicle[] = [
  { lot: "58412207", vin: "4T1BF1FK7GU128834", make: "Toyota", model: "Camry", trim: "SE", year: 2021, mileage: 74210, fuel: "بنزين", transmission: "أوتوماتيك", body: "سيدان", color: "أبيض", condition: "running", runCondition: "يدور ويعمل", damage: "أضرار أمامية", damageDescription: "صدام أمامي وغطاء المحرك متضرران، الوسائد لم تفتح، المحرك يدور بسلاسة.", retail: 21500, repair: 4300, start: 5200, increment: 100, city: "دالاس - تكساس", country: "الولايات المتحدة", auctionIdx: 0, endInHours: 3, status: "live", pool: "exterior", keys: true, title: "سليم" },
  { lot: "58412218", vin: "19XFC2F59JE034512", make: "Honda", model: "Civic", trim: "EX", year: 2020, mileage: 61250, fuel: "بنزين", transmission: "أوتوماتيك", body: "سيدان", color: "أبيض", condition: "running", runCondition: "يدور ويعمل", damage: "أضرار جانبية", damageDescription: "أضرار في الباب الأمامي الأيسر والرفرف، الهيكل سليم.", retail: 18900, repair: 2600, start: 4100, increment: 100, city: "لوس أنجلوس - كاليفورنيا", country: "الولايات المتحدة", auctionIdx: 1, endInHours: 5, status: "live", pool: "exterior", keys: true, title: "سليم" },
  { lot: "58412234", vin: "5NPE24AF0FH012345", make: "Hyundai", model: "Sonata", trim: "SEL", year: 2019, mileage: 89440, fuel: "بنزين", transmission: "أوتوماتيك", body: "سيدان", color: "رمادي", condition: "starts", runCondition: "يدور ولا يسير", damage: "أضرار خلفية", damageDescription: "أضرار خلفية متوسطة، ناقل الحركة يحتاج فحصًا.", retail: 15200, repair: 5100, start: 2600, increment: 100, city: "نيوجيرسي", country: "الولايات المتحدة", auctionIdx: 0, endInHours: 4, status: "live", pool: "exterior", keys: true, title: "سليم" },
  { lot: "58412251", vin: "1FTFW1E84MFA20112", make: "Ford", model: "F-150", trim: "XLT", year: 2021, mileage: 58120, fuel: "بنزين", transmission: "أوتوماتيك", body: "شاحنة صغيرة", color: "أزرق", condition: "running", runCondition: "يدور ويعمل", damage: "أضرار خلفية", damageDescription: "صندوق خلفي متضرر، الشاسيه سليم والإطارات بحالة جيدة.", retail: 36500, repair: 6200, start: 12500, increment: 250, city: "دالاس - تكساس", country: "الولايات المتحدة", auctionIdx: 0, endInHours: 6, status: "live", pool: "utility", keys: true, title: "سليم" },
  { lot: "58412263", vin: "1C4RJFAG4LC123456", make: "Jeep", model: "Grand Cherokee", trim: "Laredo", year: 2020, mileage: 66980, fuel: "بنزين", transmission: "أوتوماتيك", body: "SUV", color: "أسود", condition: "running", runCondition: "يدور ويعمل", damage: "أضرار مائية", damageDescription: "تعرض لمياه ارتفاع منخفض، لم تصل المياه للمقصورة.", retail: 27800, repair: 4400, start: 7400, increment: 250, city: "ميامي - فلوريدا", country: "الولايات المتحدة", auctionIdx: 1, endInHours: 7, status: "live", pool: "utility", keys: false, title: "إنقاذ" },
  { lot: "58412279", vin: "5YJ3E1EA7MF123789", make: "Tesla", model: "Model 3", trim: "Long Range", year: 2022, mileage: 42630, fuel: "كهربائي", transmission: "أوتوماتيك", body: "سيدان", color: "أبيض", condition: "running", runCondition: "يدور ويعمل", damage: "أضرار أمامية", damageDescription: "أضرار أمامية خفيفة، البطارية سليمة بنسبة 92%.", retail: 31500, repair: 5600, start: 9800, increment: 250, city: "لوس أنجلوس - كاليفورنيا", country: "الولايات المتحدة", auctionIdx: 1, endInHours: 8, status: "live", pool: "sport", keys: true, title: "سليم" },
  { lot: "58412284", vin: "WBA5R1C56KFH12345", make: "BMW", model: "330i", trim: "M Sport", year: 2019, mileage: 71400, fuel: "بنزين", transmission: "أوتوماتيك", body: "سيدان", color: "أزرق", condition: "running", runCondition: "يدور ويعمل", damage: "أضرار جانبية", damageDescription: "خدوش وأضرار سطحية على الجانب الأيمن، بدون أضرار هيكلية.", retail: 26900, repair: 2100, start: 8600, increment: 250, city: "شيكاغو - إلينوي", country: "الولايات المتحدة", auctionIdx: 0, endInHours: 9, status: "live", pool: "exterior", keys: true, title: "سليم" },
  { lot: "58412296", vin: "5XYKT3A69EG123456", make: "Kia", model: "Sportage", trim: "EX", year: 2021, mileage: 48890, fuel: "بنزين", transmission: "أوتوماتيك", body: "SUV", color: "أحمر", condition: "running", runCondition: "يدور ويعمل", damage: "أضرار طبيعية", damageDescription: "أضرار برد على السطح وغطاء المحرك، الزجاج سليم.", retail: 22900, repair: 3200, start: 5900, increment: 100, city: "أتلانتا - جورجيا", country: "الولايات المتحدة", auctionIdx: 1, endInHours: 12, status: "live", pool: "utility", keys: true, title: "سليم" },
  { lot: "58412302", vin: "1G1ZD5ST7LF123456", make: "Chevrolet", model: "Malibu", trim: "LT", year: 2020, mileage: 83120, fuel: "بنزين", transmission: "أوتوماتيك", body: "سيدان", color: "فضي", condition: "non-running", runCondition: "لا يعمل", damage: "حريق", damageDescription: "حريق محدود في حجرة المحرك، المقصورة سليمة.", retail: 17400, repair: 7800, start: 1400, increment: 100, city: "دالاس - تكساس", country: "الولايات المتحدة", auctionIdx: 0, endInHours: 10, status: "live", pool: "exterior", keys: false, title: "إنقاذ" },
  { lot: "58412317", vin: "2T3WFREV0JW123456", make: "Toyota", model: "RAV4", trim: "XLE", year: 2022, mileage: 39750, fuel: "هجين", transmission: "أوتوماتيك", body: "SUV", color: "رمادي", condition: "running", runCondition: "يدور ويعمل", damage: "بدون أضرار", damageDescription: "مركبة مستردة من التأجير بحالة ممتازة، صيانة دورية كاملة.", retail: 29400, repair: 0, start: 11200, increment: 250, city: "نيوجيرسي", country: "الولايات المتحدة", auctionIdx: 1, endInHours: 14, status: "live", pool: "utility", keys: true, title: "سليم" },
  { lot: "58412328", vin: "WP0AB2A99LS123456", make: "Porsche", model: "911", trim: "Carrera S", year: 2021, mileage: 18900, fuel: "بنزين", transmission: "أوتوماتيك", body: "كوبيه", color: "أصفر", condition: "running", runCondition: "يدور ويعمل", damage: "أضرار خلفية", damageDescription: "صدام خلفي متضرر، بقية الأجزاء بحالة الوكالة.", retail: 118000, repair: 8900, start: 48500, increment: 500, city: "لوس أنجلوس - كاليفورنيا", country: "الولايات المتحدة", auctionIdx: 1, endInHours: 16, status: "live", pool: "sport", keys: true, title: "سليم" },
  { lot: "58412336", vin: "3GCUKREC4JG123456", make: "GMC", model: "Sierra 1500", trim: "SLT", year: 2019, mileage: 96420, fuel: "بنزين", transmission: "أوتوماتيك", body: "شاحنة صغيرة", color: "أسود", condition: "starts", runCondition: "يدور ولا يسير", damage: "أضرار جانبية", damageDescription: "أضرار جانبية عميقة، التعليق الخلفي يحتاج إصلاحًا.", retail: 31200, repair: 9400, start: 6100, increment: 250, city: "شيكاغو - إلينوي", country: "الولايات المتحدة", auctionIdx: 0, endInHours: 18, status: "live", pool: "utility", keys: true, title: "إنقاذ" },
  { lot: "58412348", vin: "JTHBK1GG4F2123456", make: "Lexus", model: "ES 350", trim: "Luxury", year: 2018, mileage: 88750, fuel: "بنزين", transmission: "أوتوماتيك", body: "سيدان", color: "أسود", condition: "running", runCondition: "يدور ويعمل", damage: "أضرار أمامية", damageDescription: "صدام أمامي ومصابيح متضررة، الرادياتير سليم.", retail: 22400, repair: 3900, start: 5800, increment: 100, city: "ميامي - فلوريدا", country: "الولايات المتحدة", auctionIdx: 1, endInHours: 20, status: "live", pool: "exterior", keys: true, title: "سليم" },
  { lot: "58412359", vin: "WVGZZZ5NZKW123456", make: "Volkswagen", model: "Tiguan", trim: "SE", year: 2020, mileage: 70340, fuel: "بنزين", transmission: "أوتوماتيك", body: "SUV", color: "أبيض", condition: "running", runCondition: "يدور ويعمل", damage: "سرقة / استرداد", damageDescription: "مركبة مستردة، أقفال متضررة، لا أضرار ميكانيكية.", retail: 20900, repair: 1800, start: 6400, increment: 100, city: "أتلانتا - جورجيا", country: "الولايات المتحدة", auctionIdx: 0, endInHours: 22, status: "live", pool: "utility", keys: true, title: "سليم" },
  { lot: "58412371", vin: "SALGS2SE7LA123456", make: "Land Rover", model: "Range Rover", trim: "HSE", year: 2021, mileage: 44210, fuel: "بنزين", transmission: "أوتوماتيك", body: "SUV", color: "أبيض", condition: "running", runCondition: "يدور ويعمل", damage: "أضرار أمامية", damageDescription: "أضرار أمامية متوسطة مع وسادة هوائية واحدة.", retail: 82000, repair: 15800, start: 21500, increment: 500, city: "دبي", country: "الإمارات", auctionIdx: 2, endInHours: 74, status: "upcoming", pool: "utility", keys: true, title: "سليم" },
  { lot: "58412388", vin: "JM3KFBCM0L0123456", make: "Mazda", model: "CX-5", trim: "Touring", year: 2020, mileage: 60330, fuel: "بنزين", transmission: "أوتوماتيك", body: "SUV", color: "أحمر", condition: "running", runCondition: "يدور ويعمل", damage: "أضرار خلفية", damageDescription: "أضرار خلفية خفيفة، الباب الخلفي يحتاج استبدالًا.", retail: 23500, repair: 2900, start: 6900, increment: 100, city: "شيكاغو - إلينوي", country: "الولايات المتحدة", auctionIdx: 2, endInHours: 78, status: "upcoming", pool: "utility", keys: true, title: "سليم" },
  { lot: "58412395", vin: "1N4BL4BV7LC123456", make: "Nissan", model: "Altima", trim: "SV", year: 2021, mileage: 55320, fuel: "بنزين", transmission: "أوتوماتيك", body: "سيدان", color: "رمادي", condition: "running", runCondition: "يدور ويعمل", damage: "أضرار جانبية", damageDescription: "أضرار في الجانب الأيسر الخلفي، الإصلاح ممكن.", retail: 19800, repair: 3100, start: 4800, increment: 100, city: "نيوجيرسي", country: "الولايات المتحدة", auctionIdx: 2, endInHours: 80, status: "upcoming", pool: "exterior", keys: true, title: "سليم" },
  { lot: "58412403", vin: "WAUENAF45JN123456", make: "Audi", model: "A4", trim: "Premium Plus", year: 2019, mileage: 78960, fuel: "بنزين", transmission: "أوتوماتيك", body: "سيدان", color: "أسود", condition: "running", runCondition: "يدور ويعمل", damage: "أضرار أمامية", damageDescription: "أضرار في الصدام والزجاج الأمامي، المحرك يعمل جيدًا.", retail: 24700, repair: 4700, start: 7100, increment: 250, city: "لندن", country: "المملكة المتحدة", auctionIdx: 3, endInHours: 100, status: "upcoming", pool: "exterior", keys: true, title: "سليم" },
  { lot: "58412418", vin: "5YJSA1E26HF123456", make: "Tesla", model: "Model S", trim: "75D", year: 2018, mileage: 98540, fuel: "كهربائي", transmission: "أوتوماتيك", body: "سيدان", color: "أسود", condition: "starts", runCondition: "يدور ولا يسير", damage: "أضرار خلفية", damageDescription: "أضرار خلفية، محرك خلفي يحتاج فحصًا.", retail: 28900, repair: 11200, start: 6700, increment: 250, city: "هامبورغ", country: "ألمانيا", auctionIdx: 3, endInHours: 104, status: "upcoming", pool: "sport", keys: true, title: "إنقاذ" },
  { lot: "58412427", vin: "1C6SRFFT0LN123456", make: "Dodge", model: "Ram 1500", trim: "Laramie", year: 2020, mileage: 66240, fuel: "بنزين", transmission: "أوتوماتيك", body: "شاحنة صغيرة", color: "أبيض", condition: "running", runCondition: "يدور ويعمل", damage: "أضرار مائية", damageDescription: "أضرار مياه منخفضة المستوى، المقصورة جافة.", retail: 34800, repair: 6100, start: 10400, increment: 250, city: "فانكوفر", country: "كندا", auctionIdx: 3, endInHours: 108, status: "upcoming", pool: "utility", keys: true, title: "إنقاذ" },
  { lot: "58412439", vin: "4T1G11AK7PU123456", make: "Toyota", model: "Camry", trim: "XSE", year: 2023, mileage: 21430, fuel: "بنزين", transmission: "أوتوماتيك", body: "سيدان", color: "أبيض", condition: "running", runCondition: "يدور ويعمل", damage: "أضرار خلفية", damageDescription: "أضرار خلفية طفيفة، تقييم وكالة.", retail: 28900, repair: 2400, start: 13200, increment: 250, city: "جدة", country: "السعودية", auctionIdx: 3, endInHours: 112, status: "upcoming", pool: "exterior", keys: true, title: "سليم" },
  { lot: "58412445", vin: "5UXCR6C05L9123456", make: "BMW", model: "X5", trim: "xDrive40i", year: 2019, mileage: 74330, fuel: "بنزين", transmission: "أوتوماتيك", body: "SUV", color: "أسود", condition: "running", runCondition: "يدور ويعمل", damage: "أضرار أمامية", damageDescription: "أضرار أمامية مع وسائد هوائية، الهيكل قابل للإصلاح.", retail: 38900, repair: 12400, start: 9300, increment: 250, city: "أتلانتا - جورجيا", country: "الولايات المتحدة", auctionIdx: 4, endInHours: -96, status: "sold", pool: "utility", keys: false, title: "إنقاذ" },
  { lot: "58412452", vin: "2HGFC2F69KH123456", make: "Honda", model: "Civic", trim: "LX", year: 2019, mileage: 91220, fuel: "بنزين", transmission: "أوتوماتيك", body: "سيدان", color: "فضي", condition: "running", runCondition: "يدور ويعمل", damage: "أضرار جانبية", damageDescription: "أضرار جانبية خفيفة، المركبة تسير بشكل طبيعي.", retail: 16900, repair: 2200, start: 3900, increment: 100, city: "ميامي - فلوريدا", country: "الولايات المتحدة", auctionIdx: 4, endInHours: -92, status: "sold", pool: "exterior", keys: true, title: "سليم" },
  { lot: "58412468", vin: "1FTEW1EP9KF123456", make: "Ford", model: "F-150", trim: "Lariat", year: 2019, mileage: 87650, fuel: "بنزين", transmission: "أوتوماتيك", body: "شاحنة صغيرة", color: "رمادي", condition: "starts", runCondition: "يدور ولا يسير", damage: "أضرار خلفية", damageDescription: "أضرار خلفية وإطار خلفي، ناقل الحركة بحاجة لصيانة.", retail: 29900, repair: 8600, start: 5600, increment: 250, city: "دالاس - تكساس", country: "الولايات المتحدة", auctionIdx: 4, endInHours: -88, status: "sold", pool: "utility", keys: true, title: "إنقاذ" },
  { lot: "58412475", vin: "WDDGF4HB9CR123456", make: "Mercedes-Benz", model: "C 300", trim: "Sport", year: 2020, mileage: 64520, fuel: "بنزين", transmission: "أوتوماتيك", body: "سيدان", color: "أبيض", condition: "running", runCondition: "يدور ويعمل", damage: "أضرار أمامية", damageDescription: "أضرار أمامية طفيفة في الصدام والشبك.", retail: 32900, repair: 3600, start: 11800, increment: 250, city: "لوس أنجلوس - كاليفورنيا", country: "الولايات المتحدة", auctionIdx: 4, endInHours: -84, status: "sold", pool: "exterior", keys: true, title: "سليم" },
  { lot: "58412483", vin: "3KPF24AD6LE123456", make: "Kia", model: "Forte", trim: "GT-Line", year: 2020, mileage: 80120, fuel: "بنزين", transmission: "أوتوماتيك", body: "سيدان", color: "أزرق", condition: "running", runCondition: "يدور ويعمل", damage: "أضرار خلفية", damageDescription: "أضرار خلفية متوسطة، لم تتلقَّ أي مزايدات مطابقة للحد الأدنى.", retail: 15900, repair: 3800, start: 3900, increment: 100, city: "أتلانتا - جورجيا", country: "الولايات المتحدة", auctionIdx: 4, endInHours: -80, status: "ended", pool: "exterior", keys: true, title: "سليم" },
];

const hoursFromNow = (hours: number) => new Date(Date.now() + hours * 60 * 60 * 1000);

async function runSeed(): Promise<void> {
  const claim = await db
    .insert(platformMeta)
    .values({ key: SEED_KEY, value: "seeding" })
    .onConflictDoNothing()
    .returning({ key: platformMeta.key });

  if (claim.length === 0) return;

  const existing = await db.select({ id: users.id }).from(users).limit(1);
  if (existing.length > 0) {
    await db.update(platformMeta).set({ value: "done" }).where(eq(platformMeta.key, SEED_KEY));
    return;
  }

  await db.insert(settings).values({ id: 1 }).onConflictDoNothing();

  const adminRows = await db
    .insert(users)
    .values([
      {
        name: "إدارة منارة",
        email: "admin@manara.example",
        passwordHash: hashPassword("Admin@12345"),
        phone: "+1 800 555 0142",
        role: "admin",
        country: "الولايات المتحدة",
        city: "دالاس - تكساس",
        bidderNumber: "MN-ADMIN",
        createdAt: hoursFromNow(-2400),
      },
      {
        name: "أحمد الحربي",
        email: "bidder@manara.example",
        passwordHash: hashPassword("Bidder@12345"),
        phone: "+966 55 123 4567",
        role: "user",
        country: "السعودية",
        city: "الرياض",
        bidderNumber: "MN-100237",
        createdAt: hoursFromNow(-1400),
      },
    ])
    .returning({ id: users.id, email: users.email });

  const adminId = adminRows[0]?.id ?? 1;
  const demoId = adminRows[1]?.id ?? 2;

  const rivals = await db
    .insert(users)
    .values(
      ["سالم العتيبي", "ماركوس ريد", "ليلى حداد", "Daniel Cruz", "يوسف الشمري", "Elena Petrova"].map((name, index) => ({
        name,
        email: `bidder${index + 1}@manara.example`,
        passwordHash: hashPassword(`Bidder@${1000 + index}`),
        role: "user",
        country: ["السعودية", "الولايات المتحدة", "الإمارات", "الولايات المتحدة", "الكويت", "ألمانيا"][index],
        city: ["جدة", "دالاس - تكساس", "دبي", "ميامي - فلوريدا", "الكويت", "هامبورغ"][index],
        bidderNumber: makeBidderNumber(index + 11),
        createdAt: hoursFromNow(-900 + index * 40),
      })),
    )
    .returning({ id: users.id });

  const rivalIds = rivals.map((row) => row.id);

  const auctionRows = await db
    .insert(auctions)
    .values([
      { name: "مزاد دالاس المباشر", code: "DAL-118", location: "دالاس - تكساس", country: "الولايات المتحدة", startsAt: hoursFromNow(-4), endsAt: hoursFromNow(26), status: "live", description: "مزاد مباشر على سيارات إنقاذ وسيارات نظيفة من أسطول الشركات، مع فحص فني مسبق لكل لوت." },
      { name: "مزاد الساحل الغربي", code: "LAX-204", location: "لوس أنجلوس - كاليفورنيا", country: "الولايات المتحدة", startsAt: hoursFromNow(-2), endsAt: hoursFromNow(34), status: "live", description: "تشكيلة واسعة من السيارات الكهربائية والهجينة والسيارات الفاخرة." },
      { name: "مزاد نيوجيرسي", code: "NJ-092", location: "نيوجيرسي", country: "الولايات المتحدة", startsAt: hoursFromNow(66), endsAt: hoursFromNow(82), status: "upcoming", description: "مزاد قادم يضم أكثر من 200 لوت، التسجيل المسبق مطلوب لتأكيد المزايدة." },
      { name: "مزاد الخليج الدولي", code: "DXB-051", location: "دبي", country: "الإمارات", startsAt: hoursFromNow(92), endsAt: hoursFromNow(114), status: "upcoming", description: "سيارات فاخرة وشاحنات من منطقة الخليج مع إمكانية شحن دولي." },
      { name: "مزاد تورونتو المكتمل", code: "TOR-310", location: "تورونتو", country: "كندا", startsAt: hoursFromNow(-200), endsAt: hoursFromNow(-96), status: "ended", description: "أرشيف المزاد — جميع اللوتات تمت تسويتها وإصدار الفواتير." },
    ])
    .returning({ id: auctions.id });

  const auctionIds = auctionRows.map((row) => row.id);

  const vehicleValues = seedVehicles.map((vehicle, index) => {
    const upcomingEnd = Math.abs(vehicle.endInHours);
    const auctionStart = hoursFromNow(
      vehicle.status === "live" ? -4 : vehicle.status === "upcoming" ? upcomingEnd - 8 : -200,
    );
    const auctionEnd = hoursFromNow(
      vehicle.status === "live" ? Math.max(2, vehicle.endInHours) : vehicle.status === "upcoming" ? upcomingEnd : vehicle.endInHours,
    );
    const primaryPool = pools[vehicle.pool];
    const primary = primaryPool[index % primaryPool.length];
    const secondary = primaryPool[(index + 4) % primaryPool.length];
    const interior = INTERIOR[index % INTERIOR.length];
    return {
      lotNumber: vehicle.lot,
      vin: vehicle.vin,
      make: vehicle.make,
      model: vehicle.model,
      trim: vehicle.trim,
      year: vehicle.year,
      mileage: vehicle.mileage,
      fuelType: vehicle.fuel,
      transmission: vehicle.transmission,
      bodyType: vehicle.body,
      color: vehicle.color,
      condition: vehicle.condition,
      runCondition: vehicle.runCondition,
      damageType: vehicle.damage,
      damageDescription: vehicle.damageDescription,
      keysPresent: vehicle.keys,
      titleStatus: vehicle.title,
      seller: index % 3 === 0 ? "شركة تأجير كبرى" : index % 3 === 1 ? "شركة تأمين معتمدة" : "مالك خاص",
      retailValue: vehicle.retail,
      repairCost: vehicle.repair,
      images: [
        primary,
        secondary,
        interior,
        INTERIOR[(index + 5) % INTERIOR.length],
        ...(vehicle.damage !== "بدون أضرار" ? [DAMAGE[index % DAMAGE.length]] : []),
      ],
      locationCity: vehicle.city,
      locationCountry: vehicle.country,
      auctionId: auctionIds[vehicle.auctionIdx] ?? auctionIds[0],
      startingBid: vehicle.start,
      reservePrice: Math.round(vehicle.start * 1.25),
      minIncrement: vehicle.increment,
      currentBid: vehicle.start,
      bidCount: 0,
      status: vehicle.status,
      auctionStart,
      auctionEnd,
      createdAt: hoursFromNow(-300 + index * 6),
      updatedAt: hoursFromNow(-2),
    };
  });

  const inserted = await db
    .insert(vehicles)
    .values(vehicleValues)
    .returning({ id: vehicles.id, status: vehicles.status, startingBid: vehicles.startingBid, increment: vehicles.minIncrement, lotNumber: vehicles.lotNumber, make: vehicles.make, model: vehicles.model, year: vehicles.year, retailValue: vehicles.retailValue });

  const bidRows: { vehicleId: number; userId: number; amount: number; createdAt: Date }[] = [];
  const vehicleUpdates: Promise<unknown>[] = [];
  const soldWinners = new Map<number, { winnerId: number; amount: number }>();

  inserted.forEach((row, index) => {
    const seed = seedVehicles[index];
    if (!seed) return;
    const bidders = rivalIds.length ? rivalIds : [demoId];
    if (row.status === "live") {
      const steps = (index % 4) + 2;
      let amount = row.startingBid;
      let lastBidder = demoId;
      for (let step = 0; step < steps; step += 1) {
        amount = amount + row.increment * (1 + (step % 3));
        lastBidder = bidders[(index + step) % bidders.length] ?? demoId;
        bidRows.push({
          vehicleId: row.id,
          userId: lastBidder,
          amount,
          createdAt: hoursFromNow(-3.5 + step * 0.35 + index * 0.01),
        });
      }
      // Keep the demo account as the current leader on a few lots so the dashboard has real state.
      if (index % 5 === 0) {
        amount += row.increment;
        bidRows.push({ vehicleId: row.id, userId: demoId, amount, createdAt: hoursFromNow(-0.4) });
        lastBidder = demoId;
      }
      vehicleUpdates.push(
        db
          .update(vehicles)
          .set({ currentBid: amount, bidCount: steps + (index % 5 === 0 ? 1 : 0) })
          .where(eq(vehicles.id, row.id)),
      );
    }
    if (row.status === "sold") {
      const steps = 4 + (index % 3);
      let amount = row.startingBid;
      for (let step = 0; step < steps; step += 1) {
        amount += row.increment * (1 + (step % 2));
        bidRows.push({
          vehicleId: row.id,
          userId: bidders[(index + step) % bidders.length] ?? demoId,
          amount,
          createdAt: hoursFromNow(-120 + step * 0.5),
        });
      }
      const winnerId = index % 2 === 0 ? demoId : bidders[index % bidders.length] ?? demoId;
      bidRows.push({ vehicleId: row.id, userId: winnerId, amount: amount + row.increment, createdAt: hoursFromNow(-100) });
      soldWinners.set(row.id, { winnerId, amount: amount + row.increment });
      vehicleUpdates.push(
        db
          .update(vehicles)
          .set({
            currentBid: amount + row.increment,
            winningBid: amount + row.increment,
            winnerId,
            bidCount: steps + 1,
          })
          .where(eq(vehicles.id, row.id)),
      );
    }
  });

  if (bidRows.length) await db.insert(bids).values(bidRows);
  await Promise.all(vehicleUpdates);

  const invoiceRows = Array.from(soldWinners.entries()).map(([vehicleId, info], index) => {
    const row = inserted.find((item) => item.id === vehicleId);
    const hammer = info.amount;
    const buyerFee = Math.max(200, Math.round(hammer * 0.08));
    const docFee = 79;
    return {
      number: `INV-${new Date().getFullYear()}-${String(1001 + index)}`,
      userId: info.winnerId,
      vehicleId,
      lotNumber: row?.lotNumber ?? "",
      vehicleLabel: `${row?.year ?? ""} ${row?.make ?? ""} ${row?.model ?? ""}`.trim(),
      hammerPrice: hammer,
      buyerFee,
      docFee,
      shippingFee: index === 0 ? 650 : 0,
      total: hammer + buyerFee + docFee + (index === 0 ? 650 : 0),
      status: index === 0 ? "paid" : index === 1 ? "pending" : "pending",
      method: index === 0 ? "تحويل بنكي" : null,
      dueDate: hoursFromNow(index === 0 ? 40 : 48 + index * 12),
      paidAt: index === 0 ? hoursFromNow(-40) : null,
      createdAt: hoursFromNow(-70 + index),
    };
  });
  if (invoiceRows.length) await db.insert(invoices).values(invoiceRows);

  const watchRows = inserted.slice(0, 5).map((row, index) => ({
    userId: index % 2 === 0 ? demoId : rivalIds[0] ?? demoId,
    vehicleId: row.id,
    createdAt: hoursFromNow(-12 + index),
  }));
  await db.insert(watchlist).values(watchRows).onConflictDoNothing();

  await db.insert(notifications).values([
    {
      userId: demoId,
      title: "أنت الأعلى مزايدة حاليًا",
      body: `مزايدتك على اللوت ${inserted[0]?.lotNumber ?? ""} هي الأعلى حاليًا. سيتم إشعارك فورًا إذا تم تجاوزها.`,
      type: "bid",
      link: `/vehicles/${inserted[0]?.id ?? ""}`,
      createdAt: hoursFromNow(-1.2),
    },
    {
      userId: demoId,
      title: "تم تجاوز مزايدتك",
      body: `تم تجاوز مزايدتك على اللوت ${inserted[7]?.lotNumber ?? ""}. يمكنك المزايدة مرة أخرى قبل انتهاء المزاد.`,
      type: "bid",
      link: `/vehicles/${inserted[7]?.id ?? ""}`,
      createdAt: hoursFromNow(-2.4),
    },
    {
      userId: demoId,
      title: "فاتورة مستحقة الدفع",
      body: "لديك فاتورة بانتظار الدفع مقابل سيارة فزت بها في مزاد تورونتو. يُرجى السداد خلال 5 أيام.",
      type: "payment",
      link: "/dashboard/payments",
      createdAt: hoursFromNow(-20),
    },
    {
      userId: null,
      title: "مزاد نيوجيرسي يبدأ قريبًا",
      body: "التسجيل المسبق متاح الآن لمزاد نيوجيرسي. أضف اللوتات إلى قائمة المفضلة لمتابعتها لحظة بلحظة.",
      type: "auction",
      link: "/auctions/upcoming",
      createdAt: hoursFromNow(-6),
    },
    {
      userId: adminId,
      title: "تقرير المزاد اليومي",
      body: "تم تسجيل مزايدات جديدة في مزادي دالاس والساحل الغربي. راجع لوحة التقارير للمزيد.",
      type: "info",
      link: "/admin/reports",
      createdAt: hoursFromNow(-4),
    },
  ]);

  await db.update(platformMeta).set({ value: "done" }).where(eq(platformMeta.key, SEED_KEY));
  await db.execute(sql`select 1`);
}

let seedPromise: Promise<void> | null = null;

export async function ensureSeeded(): Promise<void> {
  if (!seedPromise) {
    seedPromise = runSeed().catch((error) => {
      seedPromise = null;
      console.error("[seed] failed:", error);
    });
  }
  return seedPromise;
}
