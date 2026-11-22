import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/**
 * MANARA Auto Auctions — database schema.
 * Money is stored as whole USD integers (vehicle auctions are settled in whole dollars).
 */

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    phone: text("phone"),
    role: text("role").notNull().default("user"), // user | admin
    status: text("status").notNull().default("active"), // active | suspended
    country: text("country").default("الولايات المتحدة"),
    city: text("city"),
    company: text("company"),
    bidderNumber: text("bidder_number").notNull(),
    notifyEmail: boolean("notify_email").notNull().default(true),
    notifySms: boolean("notify_sms").notNull().default(false),
    notifyOutbid: boolean("notify_outbid").notNull().default(true),
    notifyAuctions: boolean("notify_auctions").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("users_email_unique").on(table.email)],
);

export const sessions = pgTable("sessions", {
  token: text("token").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const auctions = pgTable("auctions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull(),
  location: text("location").notNull(),
  country: text("country").notNull().default("الولايات المتحدة"),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
  status: text("status").notNull().default("upcoming"), // upcoming | live | ended
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  lotNumber: text("lot_number").notNull(),
  vin: text("vin").notNull(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  trim: text("trim"),
  year: integer("year").notNull(),
  mileage: integer("mileage").notNull(),
  fuelType: text("fuel_type").notNull(),
  transmission: text("transmission").notNull(),
  bodyType: text("body_type").notNull(),
  color: text("color").notNull(),
  condition: text("condition").notNull(), // running | starts | non-running
  runCondition: text("run_condition").notNull(),
  damageType: text("damage_type").notNull(),
  damageDescription: text("damage_description").notNull(),
  keysPresent: boolean("keys_present").notNull().default(true),
  titleStatus: text("title_status").notNull().default("سليم"),
  seller: text("seller").notNull().default("مزاد مرخّص"),
  retailValue: integer("retail_value").notNull(),
  repairCost: integer("repair_cost").notNull().default(0),
  images: jsonb("images").$type<string[]>().notNull().default([]),
  locationCity: text("location_city").notNull(),
  locationCountry: text("location_country").notNull().default("الولايات المتحدة"),
  auctionId: integer("auction_id").references(() => auctions.id, { onDelete: "set null" }),
  startingBid: integer("starting_bid").notNull(),
  reservePrice: integer("reserve_price"),
  minIncrement: integer("min_increment").notNull().default(100),
  currentBid: integer("current_bid").notNull().default(0),
  bidCount: integer("bid_count").notNull().default(0),
  status: text("status").notNull().default("upcoming"), // upcoming | live | sold | ended
  auctionStart: timestamp("auction_start", { withTimezone: true }).notNull(),
  auctionEnd: timestamp("auction_end", { withTimezone: true }).notNull(),
  winnerId: integer("winner_id").references(() => users.id, { onDelete: "set null" }),
  winningBid: integer("winning_bid"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const bids = pgTable("bids", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id")
    .notNull()
    .references(() => vehicles.id, { onDelete: "cascade" }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const watchlist = pgTable(
  "watchlist",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    vehicleId: integer("vehicle_id")
      .notNull()
      .references(() => vehicles.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("watchlist_user_vehicle_unique").on(table.userId, table.vehicleId)],
);

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  number: text("number").notNull(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  vehicleId: integer("vehicle_id").references(() => vehicles.id, { onDelete: "set null" }),
  lotNumber: text("lot_number").notNull().default(""),
  vehicleLabel: text("vehicle_label").notNull().default(""),
  hammerPrice: integer("hammer_price").notNull(),
  buyerFee: integer("buyer_fee").notNull().default(0),
  docFee: integer("doc_fee").notNull().default(0),
  shippingFee: integer("shipping_fee").notNull().default(0),
  total: integer("total").notNull(),
  status: text("status").notNull().default("pending"), // pending | paid | overdue | cancelled
  method: text("method"),
  dueDate: timestamp("due_date", { withTimezone: true }).notNull(),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }), // null = broadcast
  title: text("title").notNull(),
  body: text("body").notNull(),
  type: text("type").notNull().default("info"), // info | bid | win | payment | auction
  link: text("link"),
  readAt: timestamp("read_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const settings = pgTable("settings", {
  id: integer("id").primaryKey().default(1),
  buyerFeePercent: integer("buyer_fee_percent").notNull().default(8),
  minBuyerFee: integer("min_buyer_fee").notNull().default(200),
  docFee: integer("doc_fee").notNull().default(79),
  sellerCommissionPercent: integer("seller_commission_percent").notNull().default(5),
  defaultIncrement: integer("default_increment").notNull().default(100),
  paymentDueDays: integer("payment_due_days").notNull().default(5),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const platformMeta = pgTable("platform_meta", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type Vehicle = typeof vehicles.$inferSelect;
export type Bid = typeof bids.$inferSelect;
export type Auction = typeof auctions.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type Settings = typeof settings.$inferSelect;
