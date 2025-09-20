import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Blog Block Types for Visual Editor
export type BlogBlockType = 
  | "header" 
  | "text" 
  | "image" 
  | "quote" 
  | "list" 
  | "divider" 
  | "spacer"
  | "button";

export interface BlogBlockStyle {
  color?: string;
  backgroundColor?: string;
  fontSize?: string;
  fontWeight?: string;
  textAlign?: "left" | "center" | "right";
  margin?: string;
  padding?: string;
  borderRadius?: string;
  border?: string;
}

export interface BlogBlock {
  id: string;
  type: BlogBlockType;
  content: Record<string, any>; // Content varies by block type
  style?: BlogBlockStyle;
  order: number;
}

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password"),
  passwordToken: text("password_token"),
  tokenExpiresAt: timestamp("token_expires_at"),
  role: text("role").notNull().default("admin"), // superadmin, admin
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const jobs = pgTable("jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  type: text("type").notNull(), // permanent, care-at-home, temporary
  location: text("location").notNull(),
  department: text("department"),
  branch: text("branch").notNull().default("Plymouth"), // Plymouth, Truro
  salaryType: text("salary_type").notNull(), // hourly, weekly, annual
  salaryMin: integer("salary_min").notNull(),
  salaryMax: integer("salary_max"),
  summary: text("summary").notNull(),
  description: text("description").notNull(),
  requirements: text("requirements"),
  benefits: text("benefits"),
  reportsTo: text("reports_to"),
  experienceLevel: text("experience_level"), // entry, 1-2-years, 3-5-years, 5-plus-years
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const applications = pgTable("applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").references(() => jobs.id).notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  location: text("location").notNull(),
  
  // How did you hear about us
  referralSource: text("referral_source"),
  
  // Current employment status
  currentlyWorking: boolean("currently_working"),
  currentEmployer: text("current_employer"),
  employmentDuration: text("employment_duration"),
  noticePeriod: text("notice_period"),
  
  // Care experience (keeping existing field)
  experience: text("experience"),
  
  // Holiday information
  hasPreBookedHoliday: boolean("has_pre_booked_holiday"),
  holidayDates: text("holiday_dates"),
  
  // Transport
  canDrive: boolean("can_drive"),
  
  // Shift preferences - storing as JSON array of selected preferences
  shiftPreferences: json("shift_preferences").$type<string[]>(), // ["Early", "Late", "Long Days", "Nights"]
  preferredHours: text("preferred_hours"), // How many hours wanting to work
  
  // Certifications
  hasDBS: boolean("has_dbs"),
  hasMHCertificate: boolean("has_mh_certificate"),
  
  // Privacy consent
  privacyConsent: boolean("privacy_consent").notNull(),
  
  // File uploads and additional info
  cvPath: text("cv_path"), // path to uploaded CV file
  additionalInfo: text("additional_info"),
  
  // Application management
  status: text("status").default("pending"), // pending, reviewed, interview, hired, rejected
  notes: text("notes"), // Admin notes about the candidate
  createdAt: timestamp("created_at").defaultNow(),
});

export const contactSubmissions = pgTable("contact_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // care-request, staff-booking
  firstName: text("first_name"),
  lastName: text("last_name"),
  contactName: text("contact_name"),
  organization: text("organization"),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  location: text("location").notNull(),
  serviceRequired: text("service_required"),
  staffType: text("staff_type"),
  numberOfStaff: integer("number_of_staff"),
  duration: text("duration"),
  careRequirements: text("care_requirements"),
  additionalRequirements: text("additional_requirements"),
  preferredStartDate: text("preferred_start_date"),
  status: text("status").default("new"), // new, contacted, quoted, closed
  createdAt: timestamp("created_at").defaultNow(),
});

export const newsletters = pgTable("newsletters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  status: text("status").notNull().default("draft"), // draft, published, archived
  subject: text("subject"),
  preheader: text("preheader"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const newsletterBlocks = pgTable("newsletter_blocks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  newsletterId: varchar("newsletter_id").references(() => newsletters.id, { onDelete: "cascade" }).notNull(),
  type: text("type").notNull(), // heading, text, image, button, divider, spacer, html
  content: json("content").$type<Record<string, any>>(),
  position: integer("position").notNull(),
  parentId: varchar("parent_id"),
});

export const templates = pgTable("templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  blocks: json("blocks").$type<Array<Record<string, any>>>(),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const subscribers = pgTable("subscribers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  status: text("status").notNull().default("pending"), // subscribed, unsubscribed, bounced, complained, pending
  preferences: json("preferences").$type<Record<string, any>>(),
  source: text("source"),
  consentAt: timestamp("consent_at"),
  consentIp: text("consent_ip"),
  unsubscribeAt: timestamp("unsubscribe_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const campaigns = pgTable("campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  newsletterId: varchar("newsletter_id").references(() => newsletters.id, { onDelete: "cascade" }).notNull(),
  subject: text("subject").notNull(),
  fromName: text("from_name").notNull(),
  fromEmail: text("from_email").notNull(),
  segment: json("segment").$type<Record<string, any>>(),
  scheduledAt: timestamp("scheduled_at"),
  sentAt: timestamp("sent_at"),
  status: text("status").notNull().default("draft"), // draft, scheduled, sending, sent, failed, canceled
  metrics: json("metrics").$type<{
    totalRecipients?: number;
    sent?: number;
    bounced?: number;
    opened?: number;
    clicked?: number;
    unsubscribed?: number;
    complained?: number;
    openRate?: number;
    clickRate?: number;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const deliveries = pgTable("deliveries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: varchar("campaign_id").references(() => campaigns.id, { onDelete: "cascade" }).notNull(),
  subscriberId: varchar("subscriber_id").references(() => subscribers.id, { onDelete: "cascade" }).notNull(),
  status: text("status").notNull().default("queued"), // queued, sent, bounced, opened, clicked, unsubscribed
  messageId: text("message_id"),
  openCount: integer("open_count").default(0),
  clickCount: integer("click_count").default(0),
  lastEventAt: timestamp("last_event_at"),
  tokenHash: text("token_hash"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const feedback = pgTable("feedback", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // service-feedback, staff-feedback, general-feedback
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  relationship: text("relationship"), // service-user, family-member, carer, staff-member, healthcare-professional
  serviceUsed: text("service_used"), // care-at-home, temporary-staff, permanent-placement, domiciliary-care
  location: text("location"),
  overallRating: integer("overall_rating").notNull(), // 1-5 scale
  qualityRating: integer("quality_rating"), // 1-5 scale  
  communicationRating: integer("communication_rating"), // 1-5 scale
  timelynessRating: integer("timeliness_rating"), // 1-5 scale
  professionalismRating: integer("professionalism_rating"), // 1-5 scale
  recommendation: integer("recommendation").notNull(), // 1-10 Net Promoter Score
  positiveAspects: text("positive_aspects"),
  improvementAreas: text("improvement_areas"),
  additionalComments: text("additional_comments"),
  consentToContact: boolean("consent_to_contact").default(false),
  consentToPublish: boolean("consent_to_publish").default(false),
  status: text("status").default("new"), // new, reviewed, responded, resolved, published
  adminNotes: text("admin_notes"),
  responseDate: timestamp("response_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const blogCategories = pgTable("blog_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const blogPosts = pgTable("blog_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content"), // Legacy content field for backwards compatibility
  blocks: json("blocks").$type<BlogBlock[]>(), // New structured content blocks
  categoryId: varchar("category_id").references(() => blogCategories.id).notNull(),
  imagePath: text("image_path"), // path to uploaded image in object storage
  readTime: text("read_time"), // e.g., "5 min read"
  author: text("author").notNull(),
  isPublished: boolean("is_published").default(false),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const loginUserSchema = z.object({
  username: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const updateUserSchema = insertUserSchema.partial().extend({
  id: z.string().optional(),
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  createdAt: true,
});

export const insertContactSubmissionSchema = createInsertSchema(contactSubmissions).omit({
  id: true,
  createdAt: true,
});

export const insertNewsletterSchema = createInsertSchema(newsletters).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNewsletterBlockSchema = createInsertSchema(newsletterBlocks).omit({
  id: true,
});

export const insertTemplateSchema = createInsertSchema(templates).omit({
  id: true,
  createdAt: true,
});

export const insertSubscriberSchema = createInsertSchema(subscribers).omit({
  id: true,
  createdAt: true,
});

export const insertCampaignSchema = createInsertSchema(campaigns).omit({
  id: true,
  createdAt: true,
});

export const insertDeliverySchema = createInsertSchema(deliveries).omit({
  id: true,
  createdAt: true,
});

export const insertFeedbackSchema = createInsertSchema(feedback).omit({
  id: true,
  createdAt: true,
  adminNotes: true,
  responseDate: true,
});

export const insertBlogCategorySchema = createInsertSchema(blogCategories).omit({
  id: true,
  createdAt: true,
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
}).extend({
  blocks: z.array(z.object({
    id: z.string(),
    type: z.enum(["header", "text", "image", "quote", "list", "divider", "spacer", "button"]),
    content: z.record(z.any()),
    style: z.object({
      color: z.string().optional(),
      backgroundColor: z.string().optional(),
      fontSize: z.string().optional(),
      fontWeight: z.string().optional(),
      textAlign: z.enum(["left", "center", "right"]).optional(),
      margin: z.string().optional(),
      padding: z.string().optional(),
      borderRadius: z.string().optional(),
      border: z.string().optional(),
    }).optional(),
    order: z.number(),
  })).optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobs.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applications.$inferSelect;
export type InsertContactSubmission = z.infer<typeof insertContactSubmissionSchema>;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type InsertNewsletter = z.infer<typeof insertNewsletterSchema>;
export type Newsletter = typeof newsletters.$inferSelect;
export type InsertNewsletterBlock = z.infer<typeof insertNewsletterBlockSchema>;
export type NewsletterBlock = typeof newsletterBlocks.$inferSelect;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type Template = typeof templates.$inferSelect;
export type InsertSubscriber = z.infer<typeof insertSubscriberSchema>;
export type Subscriber = typeof subscribers.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Campaign = typeof campaigns.$inferSelect;
export type InsertDelivery = z.infer<typeof insertDeliverySchema>;
export type Delivery = typeof deliveries.$inferSelect;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type Feedback = typeof feedback.$inferSelect;
export type InsertBlogCategory = z.infer<typeof insertBlogCategorySchema>;
export type BlogCategory = typeof blogCategories.$inferSelect;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;
