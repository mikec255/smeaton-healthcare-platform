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

// GDPR Audit Logging Table
export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  username: text("username").notNull(), // Denormalized for faster queries
  action: text("action").notNull(), // view, create, update, delete, export, etc.
  resourceType: text("resource_type").notNull(), // job, application, contact, user, etc.
  resourceId: varchar("resource_id"), // ID of the affected resource
  details: json("details").$type<Record<string, any>>(), // Additional context
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
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

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

// CQC Audit and Compliance Tables
export const cqcAudits = pgTable("cqc_audits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  auditType: text("audit_type").notNull(), // fundamental_standards, staff_recruitment, training_compliance, supervision_monitoring, record_keeping
  category: text("category").notNull(), // safe, effective, caring, responsive, well_led, dbs_checks, training, supervision, documentation
  status: text("status").default("draft"), // draft, in_progress, completed, approved
  auditDate: timestamp("audit_date").notNull(),
  auditorId: varchar("auditor_id").references(() => users.id).notNull(),
  auditorName: text("auditor_name").notNull(), // Denormalized for faster queries
  score: integer("score"), // Overall percentage score
  totalItems: integer("total_items"), // Total checklist items
  compliantItems: integer("compliant_items"), // Number of compliant items
  actionItemsCount: integer("action_items_count"), // Items requiring action
  findings: text("findings"), // General audit findings
  recommendations: text("recommendations"), // Recommendations for improvement
  nextAuditDue: timestamp("next_audit_due"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const cqcAuditCategories = pgTable("cqc_audit_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  auditType: text("audit_type").notNull(), // fundamental_standards, compliance_specific
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const cqcChecklistItems = pgTable("cqc_checklist_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  categoryId: varchar("category_id").references(() => cqcAuditCategories.id).notNull(),
  itemText: text("item_text").notNull(),
  guidance: text("guidance"), // Additional guidance for the checklist item
  regulationReference: text("regulation_reference"), // e.g., "Regulation 18", "Regulation 19"
  isRequired: boolean("is_required").default(true), // Is this a mandatory requirement
  section: text("section"), // Sub-section within the category
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const cqcAuditResponses = pgTable("cqc_audit_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  auditId: varchar("audit_id").references(() => cqcAudits.id, { onDelete: "cascade" }).notNull(),
  checklistItemId: varchar("checklist_item_id").references(() => cqcChecklistItems.id).notNull(),
  isCompliant: boolean("is_compliant").notNull(),
  evidence: text("evidence"), // Evidence/notes for compliance
  actionRequired: text("action_required"), // What action is needed if non-compliant
  actionDueDate: timestamp("action_due_date"),
  actionOwner: text("action_owner"), // Who is responsible for the action
  actionStatus: text("action_status").default("pending"), // pending, in_progress, completed, overdue
  actionCompletedDate: timestamp("action_completed_date"),
  notes: text("notes"), // Additional notes
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const cqcComplianceRecords = pgTable("cqc_compliance_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  staffId: text("staff_id"), // If related to specific staff member
  staffName: text("staff_name"), // Name of staff member
  recordType: text("record_type").notNull(), // dbs_check, training_record, supervision_record, reference_check, professional_registration
  title: text("title").notNull(),
  issueDate: timestamp("issue_date"),
  expiryDate: timestamp("expiry_date"),
  renewalDue: timestamp("renewal_due"),
  status: text("status").default("active"), // active, expired, pending_renewal, overdue
  certificateNumber: text("certificate_number"),
  issuingBody: text("issuing_body"),
  documentPath: text("document_path"), // Path to uploaded document
  notes: text("notes"),
  reminderSent: boolean("reminder_sent").default(false),
  lastReminderDate: timestamp("last_reminder_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Staff Knowledge Assessment Tables
export const knowledgeQuestionnaires = pgTable("knowledge_questionnaires", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // mandatory_core, care_specific, professional_standards, specialized, scenario_testing
  subcategory: text("subcategory").notNull(), // safeguarding, mental_capacity, health_safety, etc.
  isActive: boolean("is_active").default(true),
  timeLimit: integer("time_limit"), // Time limit in minutes (optional)
  passingScore: integer("passing_score").default(70), // Percentage required to pass
  instructions: text("instructions"), // Instructions for completing the assessment
  shareableLink: text("shareable_link").unique(), // UUID for shareable link
  qrCode: text("qr_code"), // Base64 encoded QR code
  emailTemplate: text("email_template"), // Pre-filled email template
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const knowledgeQuestions = pgTable("knowledge_questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  questionnaireId: varchar("questionnaire_id").references(() => knowledgeQuestionnaires.id, { onDelete: "cascade" }).notNull(),
  questionText: text("question_text").notNull(),
  questionType: text("question_type").notNull(), // multiple_choice, scenario_based, true_false, short_answer
  options: json("options").$type<string[]>(), // For multiple choice questions
  correctAnswer: text("correct_answer"), // Correct answer for objective questions
  explanation: text("explanation"), // Explanation of the correct answer
  points: integer("points").default(1), // Points awarded for correct answer
  sortOrder: integer("sort_order").default(0),
  isRequired: boolean("is_required").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const knowledgeSessions = pgTable("knowledge_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  questionnaireId: varchar("questionnaire_id").references(() => knowledgeQuestionnaires.id, { onDelete: "cascade" }).notNull(),
  staffEmail: text("staff_email").notNull(),
  staffName: text("staff_name").notNull(),
  status: text("status").default("in_progress"), // in_progress, completed, abandoned
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  timeSpent: integer("time_spent"), // Time spent in minutes
  totalScore: integer("total_score"), // Total points scored
  maxScore: integer("max_score"), // Maximum possible points
  percentageScore: integer("percentage_score"), // Percentage score
  passed: boolean("passed"), // Whether they passed based on passing score
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const knowledgeResponses = pgTable("knowledge_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").references(() => knowledgeSessions.id, { onDelete: "cascade" }).notNull(),
  questionId: varchar("question_id").references(() => knowledgeQuestions.id).notNull(),
  answer: text("answer").notNull(), // The staff member's answer
  isCorrect: boolean("is_correct"), // Whether the answer is correct (for objective questions)
  pointsAwarded: integer("points_awarded").default(0), // Points awarded for this answer
  timeSpent: integer("time_spent"), // Time spent on this question in seconds
  reviewNotes: text("review_notes"), // Notes for manual review (subjective questions)
  needsReview: boolean("needs_review").default(false), // Whether this response needs manual review
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const knowledgeActions = pgTable("knowledge_actions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").references(() => knowledgeSessions.id, { onDelete: "cascade" }).notNull(),
  actionType: text("action_type").notNull(), // training_required, follow_up_needed, competency_check, no_action
  actionDescription: text("action_description").notNull(),
  actionDueDate: timestamp("action_due_date"),
  assignedTo: varchar("assigned_to").references(() => users.id),
  status: text("status").default("pending"), // pending, in_progress, completed, overdue
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCqcAuditSchema = createInsertSchema(cqcAudits).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCqcAuditCategorySchema = createInsertSchema(cqcAuditCategories).omit({
  id: true,
  createdAt: true,
});

export const insertCqcChecklistItemSchema = createInsertSchema(cqcChecklistItems).omit({
  id: true,
  createdAt: true,
});

export const insertCqcAuditResponseSchema = createInsertSchema(cqcAuditResponses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCqcComplianceRecordSchema = createInsertSchema(cqcComplianceRecords).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertKnowledgeQuestionnaireSchema = createInsertSchema(knowledgeQuestionnaires).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertKnowledgeQuestionSchema = createInsertSchema(knowledgeQuestions).omit({
  id: true,
  createdAt: true,
});

export const insertKnowledgeSessionSchema = createInsertSchema(knowledgeSessions).omit({
  id: true,
  createdAt: true,
});

export const insertKnowledgeResponseSchema = createInsertSchema(knowledgeResponses).omit({
  id: true,
  createdAt: true,
});

export const insertKnowledgeActionSchema = createInsertSchema(knowledgeActions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
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
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertCqcAudit = z.infer<typeof insertCqcAuditSchema>;
export type CqcAudit = typeof cqcAudits.$inferSelect;
export type InsertCqcAuditCategory = z.infer<typeof insertCqcAuditCategorySchema>;
export type CqcAuditCategory = typeof cqcAuditCategories.$inferSelect;
export type InsertCqcChecklistItem = z.infer<typeof insertCqcChecklistItemSchema>;
export type CqcChecklistItem = typeof cqcChecklistItems.$inferSelect;
export type InsertCqcAuditResponse = z.infer<typeof insertCqcAuditResponseSchema>;
export type CqcAuditResponse = typeof cqcAuditResponses.$inferSelect;
export type InsertCqcComplianceRecord = z.infer<typeof insertCqcComplianceRecordSchema>;
export type CqcComplianceRecord = typeof cqcComplianceRecords.$inferSelect;
export type InsertKnowledgeQuestionnaire = z.infer<typeof insertKnowledgeQuestionnaireSchema>;
export type KnowledgeQuestionnaire = typeof knowledgeQuestionnaires.$inferSelect;
export type InsertKnowledgeQuestion = z.infer<typeof insertKnowledgeQuestionSchema>;
export type KnowledgeQuestion = typeof knowledgeQuestions.$inferSelect;
export type InsertKnowledgeSession = z.infer<typeof insertKnowledgeSessionSchema>;
export type KnowledgeSession = typeof knowledgeSessions.$inferSelect;
export type InsertKnowledgeResponse = z.infer<typeof insertKnowledgeResponseSchema>;
export type KnowledgeResponse = typeof knowledgeResponses.$inferSelect;
export type InsertKnowledgeAction = z.infer<typeof insertKnowledgeActionSchema>;
export type KnowledgeAction = typeof knowledgeActions.$inferSelect;
