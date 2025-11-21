import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, json, doublePrecision, date, time, unique, index } from "drizzle-orm/pg-core";
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
  width?: string; // Width for side-by-side layout: "33%", "50%", "66%", "100%"
  imageWidth?: string; // For image blocks: "small", "medium", "large", "full"
  layout?: "inline" | "full"; // Whether block is inline (side-by-side) or full width
}

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password"),
  passwordToken: text("password_token"),
  tokenExpiresAt: timestamp("token_expires_at"),
  role: text("role").notNull().default("admin"), // superadmin, admin
  permissions: json("permissions").$type<{
    overview?: boolean;           // Dashboard access
    recruitment?: boolean;        // Jobs and applications
    customerRelations?: boolean;  // Referrals and contact enquiries
    feedback?: boolean;           // Customer feedback
    tools?: boolean;              // Calculators, CQC toolkit, audit logs
    resources?: boolean;          // Blog and newsletters
    system?: boolean;             // User management (superadmin only)
  }>(),
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

// Full Job Applications (comprehensive application form - separate from pre-screens)
export const fullApplications = pgTable("full_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").references(() => jobs.id),
  preScreenApplicationId: varchar("pre_screen_application_id").references(() => applications.id),
  
  // Personal Information
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dateOfBirth: date("date_of_birth").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  postcode: text("postcode").notNull(),
  nationalInsuranceNumber: text("national_insurance_number"),
  gender: text("gender"), // Male, Female, Other, Prefer not to say
  maritalStatus: text("marital_status"),
  ethnicOrigin: text("ethnic_origin"),
  nationality: text("nationality"),
  
  // Next of Kin
  nextOfKinName: text("next_of_kin_name"),
  nextOfKinPhone: text("next_of_kin_phone"),
  nextOfKinAddress: text("next_of_kin_address"),
  
  // Payroll Information
  payrollType: text("payroll_type"), // PAYE, Self-employed
  bankName: text("bank_name"),
  accountType: text("account_type"), // Personal, Business
  accountName: text("account_name"),
  accountNumber: text("account_number"),
  sortCode: text("sort_code"),
  
  // Worker Profile
  workerTypes: json("worker_types").$type<string[]>(), // ["Carer", "Support Worker", "Nurse", etc.]
  travelMethod: text("travel_method"),
  travelDistance: text("travel_distance"), // How far willing to travel
  leadSkills: json("lead_skills").$type<string[]>(), // ["Elderly", "Dementia", "Learning Disabilities", etc.]
  shiftPreferences: text("shift_preferences"), // Any, Days, Nights, etc.
  availableDays: json("available_days").$type<string[]>(), // ["Monday", "Tuesday", etc.]
  
  // Health & Compliance
  medicalConditions: json("medical_conditions").$type<string[]>(), // List of conditions or "None"
  medicationAffectsDriving: boolean("medication_affects_driving"),
  medicalAffectsNightWork: boolean("medical_affects_night_work"),
  hasCriminalConvictions: boolean("has_criminal_convictions"),
  convictionDetails: text("conviction_details"),
  dbsConsent: boolean("dbs_consent").notNull(),
  workingTimeDirectiveOptOut: boolean("working_time_directive_opt_out"),
  
  // Data Protection
  dataProtectionConsent: boolean("data_protection_consent").notNull(),
  dataTypesConsented: json("data_types_consented").$type<string[]>(),
  dataHoldingConsent: boolean("data_holding_consent").notNull(),
  
  // Application Management
  status: text("status").default("submitted"), // submitted, under-review, interview, offer-made, hired, rejected
  adminNotes: text("admin_notes"),
  submittedAt: timestamp("submitted_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
});

// Employment History (multiple entries per application)
export const employmentHistory = pgTable("employment_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  applicationId: varchar("application_id").references(() => fullApplications.id, { onDelete: "cascade" }).notNull(),
  companyName: text("company_name").notNull(),
  jobTitle: text("job_title").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  currentlyEmployed: boolean("currently_employed").default(false),
  reasonForLeaving: text("reason_for_leaving"),
  managerName: text("manager_name"),
  managerPhone: text("manager_phone"),
  managerEmail: text("manager_email"),
  orderIndex: integer("order_index").notNull().default(0),
});

// Education Records (multiple entries per application)
export const educationRecords = pgTable("education_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  applicationId: varchar("application_id").references(() => fullApplications.id, { onDelete: "cascade" }).notNull(),
  qualificationType: text("qualification_type").notNull(), // NVQ, Diploma, GCSE, Degree, etc.
  qualificationName: text("qualification_name").notNull(),
  institution: text("institution"),
  yearObtained: text("year_obtained"),
  orderIndex: integer("order_index").notNull().default(0),
});

// Application References (2-3 references per application)
export const applicationReferences = pgTable("application_references", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  applicationId: varchar("application_id").references(() => fullApplications.id, { onDelete: "cascade" }).notNull(),
  referenceType: text("reference_type").notNull(), // Professional, Character
  fullName: text("full_name").notNull(),
  company: text("company"),
  jobTitle: text("job_title"),
  relationship: text("relationship"), // For character references
  startDate: date("start_date"),
  endDate: date("end_date"),
  applicantJobTitle: text("applicant_job_title"),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  orderIndex: integer("order_index").notNull().default(0),
});

// Application Documents (multiple file uploads per application)
export const applicationDocuments = pgTable("application_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  applicationId: varchar("application_id").references(() => fullApplications.id, { onDelete: "cascade" }).notNull(),
  documentType: text("document_type").notNull(), // proof-of-address, id, qualification, cv, dbs, other
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  fileSize: integer("file_size"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
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

export interface BlogImage {
  id: string;
  url: string;
  isFeatured: boolean;
  uploadedAt?: string;
}

export const blogPosts = pgTable("blog_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content"), // Legacy content field for backwards compatibility
  blocks: json("blocks").$type<BlogBlock[]>(), // New structured content blocks
  categoryId: varchar("category_id").references(() => blogCategories.id).notNull(),
  images: json("images").$type<BlogImage[]>(), // Array of images with featured status
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

export const insertFullApplicationSchema = createInsertSchema(fullApplications).omit({
  id: true,
  submittedAt: true,
  reviewedAt: true,
  reviewedBy: true,
});

export const insertEmploymentHistorySchema = createInsertSchema(employmentHistory).omit({
  id: true,
});

export const insertEducationRecordSchema = createInsertSchema(educationRecords).omit({
  id: true,
});

export const insertApplicationReferenceSchema = createInsertSchema(applicationReferences).omit({
  id: true,
});

export const insertApplicationDocumentSchema = createInsertSchema(applicationDocuments).omit({
  id: true,
  uploadedAt: true,
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

// CQC Audit and Compliance Tables (2024 Single Assessment Framework)
export const cqcAudits = pgTable("cqc_audits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  auditType: text("audit_type").notNull(), // single_assessment, targeted_inspection, comprehensive_inspection
  category: text("category").notNull(), // insurance, safeguarding, health_safety, etc.
  serviceType: text("service_type").notNull(), // domiciliary_care, residential_care, supported_living, community_health
  keyQuestion: text("key_question").notNull(), // safe, effective, caring, responsive, well_led, overall
  status: text("status").default("draft"), // draft, in_progress, completed, approved, submitted_to_cqc
  auditDate: timestamp("audit_date").notNull(),
  auditorId: varchar("auditor_id").references(() => users.id).notNull(),
  auditorName: text("auditor_name").notNull(), // Denormalized for faster queries
  inspectorName: text("inspector_name"), // CQC inspector if external inspection
  overallRating: text("overall_rating"), // outstanding, good, requires_improvement, inadequate
  findings: text("findings"), // General audit findings
  areasOfStrength: text("areas_of_strength"), // What's working well
  areasForImprovement: text("areas_for_improvement"), // What needs improvement
  actionPlan: text("action_plan"), // Improvement action plan
  nextAuditDue: timestamp("next_audit_due"),
  evidenceSubmitted: boolean("evidence_submitted").default(false),
  cqcSubmissionDate: timestamp("cqc_submission_date"),
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

// CQC Quality Statements (2024 Framework - 34 statements)
export const cqcQualityStatements = pgTable("cqc_quality_statements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  keyQuestion: text("key_question").notNull(), // safe, effective, caring, responsive, well_led
  statementNumber: text("statement_number").notNull(), // e.g., "S1.1", "E2.3"
  statementText: text("statement_text").notNull(), // The actual "We" statement
  description: text("description").notNull(), // Detailed description of what this means
  regulationReferences: json("regulation_references").$type<string[]>(), // Associated regulations
  evidenceTypes: json("evidence_types").$type<string[]>(), // What evidence is needed
  applicableServices: json("applicable_services").$type<string[]>(), // Which service types this applies to
  priorityLevel: text("priority_level").default("standard"), // high, standard, low
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Evidence Categories (6 categories from 2024 framework)
export const cqcEvidenceCategories = pgTable("cqc_evidence_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  categoryName: text("category_name").notNull(), // people_experience, staff_feedback, leadership_feedback, partner_feedback, observations, processes_outcomes
  displayName: text("display_name").notNull(), // Human-readable name
  description: text("description").notNull(),
  exampleEvidence: json("example_evidence").$type<string[]>(), // Examples of evidence for this category
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
});

// Evidence Files Upload System
export const cqcAuditEvidence = pgTable("cqc_audit_evidence", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  auditId: varchar("audit_id").references(() => cqcAudits.id, { onDelete: "cascade" }).notNull(),
  qualityStatementId: varchar("quality_statement_id").references(() => cqcQualityStatements.id),
  evidenceCategoryId: varchar("evidence_category_id").references(() => cqcEvidenceCategories.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  fileType: text("file_type"), // document, image, video, audio
  filePath: text("file_path"), // Path to uploaded file
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size"), // File size in bytes
  uploadedBy: varchar("uploaded_by").references(() => users.id).notNull(),
  tags: json("tags").$type<string[]>(), // Searchable tags
  isConfidential: boolean("is_confidential").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Legacy table - temporarily kept to prevent rename detection during schema push
export const cqcAuditResponses = pgTable("cqc_audit_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  auditId: varchar("audit_id").references(() => cqcAudits.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// CQC Quality Statement Assessments (replaces audit responses)
export const cqcQualityAssessments = pgTable("cqc_quality_assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  auditId: varchar("audit_id").references(() => cqcAudits.id, { onDelete: "cascade" }).notNull(),
  qualityStatementId: varchar("quality_statement_id").references(() => cqcQualityStatements.id).notNull(),
  complianceLevel: text("compliance_level").notNull(), // outstanding, good, requires_improvement, inadequate, not_assessed
  evidenceSummary: text("evidence_summary"), // Summary of evidence for this statement
  strengths: text("strengths"), // What's working well for this statement
  concernsRisks: text("concerns_risks"), // Areas of concern or risk
  actionRequired: text("action_required"), // What action is needed
  actionOwner: text("action_owner"), // Who is responsible
  actionDueDate: timestamp("action_due_date"),
  actionStatus: text("action_status").default("pending"), // pending, in_progress, completed, overdue
  actionCompletedDate: timestamp("action_completed_date"),
  evidenceAttached: boolean("evidence_attached").default(false), // Whether evidence files are attached
  inspectorNotes: text("inspector_notes"), // CQC inspector notes if applicable
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

// Full Recruitment Applications (separate from job-specific pre-screening applications)
export const recruitmentApplications = pgTable("recruitment_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Personal Information
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  
  // Application data (stored as JSON to allow flexible form structure)
  applicationData: json("application_data").$type<Record<string, any>>(),
  
  // File uploads
  cvPath: text("cv_path"), // path to uploaded CV file
  documentsPath: json("documents_path").$type<string[]>(), // paths to other uploaded documents
  
  // Application management
  status: text("status").default("pending"), // pending, under_review, interview_scheduled, hired, rejected, withdrawn
  adminNotes: text("admin_notes"), // Admin notes about the application
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  
  // Source tracking
  source: text("source").default("direct_application"), // direct_application, referral, website, etc.
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Professional References (for job applicants)
export const professionalReferences = pgTable("professional_references", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Person being referenced
  candidateName: text("candidate_name").notNull(),
  candidateEmail: text("candidate_email").notNull(),
  positionAppliedFor: text("position_applied_for").notNull(),
  
  // Reference provider information
  referenceProviderName: text("reference_provider_name").notNull(),
  referenceProviderTitle: text("reference_provider_title").notNull(),
  referenceProviderCompany: text("reference_provider_company").notNull(),
  referenceProviderEmail: text("reference_provider_email").notNull(),
  referenceProviderPhone: text("reference_provider_phone").notNull(),
  
  // Reference details (stored as JSON to allow flexible structure)
  referenceData: json("reference_data").$type<Record<string, any>>(),
  
  // Reference management
  status: text("status").default("pending"), // pending, reviewed, verified, flagged
  adminNotes: text("admin_notes"), // Admin notes about the reference
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  
  // Source tracking
  source: text("source").default("direct_submission"), // direct_submission, email_invite, etc.
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Route Planning Tables for Domiciliary Care Service

// Time slot enum values
export const timeSlotEnum = ["Morning", "Lunch", "Tea", "Bed"] as const;
export type TimeSlot = typeof timeSlotEnum[number];

// Status enum values for visits and runs
export const visitStatusEnum = ["scheduled", "completed", "cancelled", "no_access"] as const;
export type VisitStatus = typeof visitStatusEnum[number];

export const runStatusEnum = ["draft", "optimized", "final", "completed"] as const;
export type RunStatus = typeof runStatusEnum[number];

// Clients table for storing client addresses and information
export const clients = pgTable("clients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  addressLine: text("address_line").notNull(),
  postcode: text("postcode").notNull(),
  normalizedPostcode: text("normalized_postcode"), // For reliable postcode searches
  latitude: doublePrecision("latitude"), // Better precision for coordinates
  longitude: doublePrecision("longitude"),
  phone: text("phone"),
  notes: text("notes"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  postcodeIdx: index("clients_postcode_idx").on(table.normalizedPostcode),
  isActiveIdx: index("clients_active_idx").on(table.isActive),
}));

// Visits table for storing scheduled visits
export const visits = pgTable("visits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").notNull().references(() => clients.id),
  visitDate: date("visit_date").notNull(),
  timeSlot: text("time_slot").notNull(), // 'AM', 'Lunch', 'Tea', 'Bed'
  windowStart: time("window_start"), // Start of time window (e.g., '08:00:00')
  windowEnd: time("window_end"), // End of time window (e.g., '10:00:00')
  durationMinutes: integer("duration_minutes").notNull().default(30),
  notes: text("notes"),
  status: text("status").notNull().default("scheduled"), // scheduled, completed, cancelled, no_access
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  visitDateIdx: index("visits_date_idx").on(table.visitDate),
  clientDateIdx: index("visits_client_date_idx").on(table.clientId, table.visitDate),
  statusIdx: index("visits_status_idx").on(table.status),
  // Unique constraint to prevent duplicate visits
  uniqueClientDateSlot: unique("visits_client_date_slot").on(table.clientId, table.visitDate, table.timeSlot),
}));

// Runs table for storing planned routes
export const runs = pgTable("runs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  runDate: date("run_date").notNull(),
  travelMode: text("travel_mode").notNull().default("walking"), // 'walking', 'driving'
  totalDistanceMeters: integer("total_distance_meters").default(0),
  totalTravelMinutes: integer("total_travel_minutes").default(0),
  totalServiceMinutes: integer("total_service_minutes").default(0),
  departureTime: time("departure_time").default("08:00:00"), // Proper time type
  status: text("status").notNull().default("draft"), // draft, optimized, final, completed
  options: json("options").$type<Record<string, any>>(), // slot windows, preferences, etc.
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  runDateIdx: index("runs_date_idx").on(table.runDate),
  createdByIdx: index("runs_created_by_idx").on(table.createdBy),
  statusIdx: index("runs_status_idx").on(table.status),
  travelModeIdx: index("runs_travel_mode_idx").on(table.travelMode),
}));

// Run stops table for storing ordered visits in each run
export const runStops = pgTable("run_stops", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  runId: varchar("run_id").notNull().references(() => runs.id, { onDelete: "cascade" }),
  visitId: varchar("visit_id").references(() => visits.id), // Nullable for ad-hoc stops
  stopOrder: integer("stop_order").notNull(), // Sequence in the run
  
  // For ad-hoc stops (when visitId is null)
  adHocAddress: text("ad_hoc_address"),
  adHocLatitude: doublePrecision("ad_hoc_latitude"),
  adHocLongitude: doublePrecision("ad_hoc_longitude"),
  adHocDuration: integer("ad_hoc_duration"), // Duration in minutes for ad-hoc stops
  
  // Timing information
  estimatedArrival: time("estimated_arrival"), // Proper time type
  estimatedDeparture: time("estimated_departure"), // Proper time type
  legDistanceMeters: integer("leg_distance_meters").default(0), // distance from previous stop
  legTravelMinutes: integer("leg_travel_minutes").default(0), // travel time from previous stop
  waitMinutes: integer("wait_minutes").default(0), // waiting time if arriving early
  lateMinutes: integer("late_minutes").default(0), // lateness if arriving after time window
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  runIdIdx: index("run_stops_run_id_idx").on(table.runId),
  uniqueRunOrder: unique("run_stops_run_order").on(table.runId, table.stopOrder),
  // Check constraint to ensure either visitId OR ad-hoc coordinates exist
  // This will be added via raw SQL in migrations if needed
}));

// Geocoding cache to store Google Maps results
export const geocodeCache = pgTable("geocode_cache", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cacheKey: text("cache_key").notNull().unique(), // Normalized query key (address/postcode)
  originalQuery: text("original_query").notNull(), // Original user input
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  formattedAddress: text("formatted_address").notNull(),
  postcode: text("postcode"), // Extracted postcode
  placeId: text("place_id"), // Google Place ID for reference
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(), // For TTL/refresh policy
}, (table) => ({
  cacheKeyIdx: index("geocode_cache_key_idx").on(table.cacheKey),
  updatedAtIdx: index("geocode_cache_updated_idx").on(table.updatedAt),
}));

export const insertCqcAuditSchema = createInsertSchema(cqcAudits).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCqcAuditCategorySchema = createInsertSchema(cqcAuditCategories).omit({
  id: true,
  createdAt: true,
});

export const insertCqcQualityStatementSchema = createInsertSchema(cqcQualityStatements).omit({
  id: true,
  createdAt: true,
});

export const insertCqcEvidenceCategorySchema = createInsertSchema(cqcEvidenceCategories).omit({
  id: true,
});

export const insertCqcAuditEvidenceSchema = createInsertSchema(cqcAuditEvidence).omit({
  id: true,
  createdAt: true,
});

export const insertCqcQualityAssessmentSchema = createInsertSchema(cqcQualityAssessments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCqcComplianceRecordSchema = createInsertSchema(cqcComplianceRecords).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Note: If cqcChecklistItems table doesn't exist, this schema acts as a placeholder
// The actual implementation might need to reference a different table or be removed
export const insertCqcChecklistItemSchema = createInsertSchema(cqcComplianceRecords).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Legacy audit responses schema (for backward compatibility)
export const insertCqcAuditResponseSchema = createInsertSchema(cqcAuditResponses).omit({
  id: true,
  createdAt: true,
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

export const insertRecruitmentApplicationSchema = createInsertSchema(recruitmentApplications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  reviewedAt: true,
  adminNotes: true,
  reviewedBy: true,
});

export const insertProfessionalReferenceSchema = createInsertSchema(professionalReferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  reviewedAt: true,
  adminNotes: true,
  reviewedBy: true,
});

// Route Planning Insert Schemas
export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVisitSchema = createInsertSchema(visits).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRunSchema = createInsertSchema(runs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRunStopSchema = createInsertSchema(runStops).omit({
  id: true,
  createdAt: true,
});

export const insertGeocodeSchema = createInsertSchema(geocodeCache).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobs.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applications.$inferSelect;
export type InsertFullApplication = z.infer<typeof insertFullApplicationSchema>;
export type FullApplication = typeof fullApplications.$inferSelect;
export type InsertEmploymentHistory = z.infer<typeof insertEmploymentHistorySchema>;
export type EmploymentHistory = typeof employmentHistory.$inferSelect;
export type InsertEducationRecord = z.infer<typeof insertEducationRecordSchema>;
export type EducationRecord = typeof educationRecords.$inferSelect;
export type InsertApplicationReference = z.infer<typeof insertApplicationReferenceSchema>;
export type ApplicationReference = typeof applicationReferences.$inferSelect;
export type InsertApplicationDocument = z.infer<typeof insertApplicationDocumentSchema>;
export type ApplicationDocument = typeof applicationDocuments.$inferSelect;
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
export type InsertCqcQualityStatement = z.infer<typeof insertCqcQualityStatementSchema>;
export type CqcQualityStatement = typeof cqcQualityStatements.$inferSelect;
export type InsertCqcEvidenceCategory = z.infer<typeof insertCqcEvidenceCategorySchema>;
export type CqcEvidenceCategory = typeof cqcEvidenceCategories.$inferSelect;
export type InsertCqcAuditEvidence = z.infer<typeof insertCqcAuditEvidenceSchema>;
export type CqcAuditEvidence = typeof cqcAuditEvidence.$inferSelect;
export type InsertCqcQualityAssessment = z.infer<typeof insertCqcQualityAssessmentSchema>;
export type CqcQualityAssessment = typeof cqcQualityAssessments.$inferSelect;
export type InsertCqcComplianceRecord = z.infer<typeof insertCqcComplianceRecordSchema>;
export type CqcComplianceRecord = typeof cqcComplianceRecords.$inferSelect;
export type InsertCqcChecklistItem = z.infer<typeof insertCqcChecklistItemSchema>;
export type CqcChecklistItem = typeof cqcComplianceRecords.$inferSelect; // Using compliance records as base
export type InsertCqcAuditResponse = z.infer<typeof insertCqcAuditResponseSchema>;
export type CqcAuditResponse = typeof cqcAuditResponses.$inferSelect;
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
export type InsertRecruitmentApplication = z.infer<typeof insertRecruitmentApplicationSchema>;
export type RecruitmentApplication = typeof recruitmentApplications.$inferSelect;
export type InsertProfessionalReference = z.infer<typeof insertProfessionalReferenceSchema>;
export type ProfessionalReference = typeof professionalReferences.$inferSelect;

// Route Planning Types
export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;
export type InsertVisit = z.infer<typeof insertVisitSchema>;
export type Visit = typeof visits.$inferSelect;
export type InsertRun = z.infer<typeof insertRunSchema>;
export type Run = typeof runs.$inferSelect;
export type InsertRunStop = z.infer<typeof insertRunStopSchema>;
export type RunStop = typeof runStops.$inferSelect;
export type InsertGeocode = z.infer<typeof insertGeocodeSchema>;
export type Geocode = typeof geocodeCache.$inferSelect;

// Finance Reports
export const financeReports = pgTable("finance_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reportMonth: date("report_month").notNull(), // Month and year this report is for
  
  // Carers Section
  trainingELearning: doublePrecision("training_e_learning").default(0),
  trainingPractical: doublePrecision("training_practical").default(0),
  shadowShifts: doublePrecision("shadow_shifts").default(0),
  hoursDays: doublePrecision("hours_days").default(0),
  nightsWakings: doublePrecision("nights_wakings").default(0),
  nightsSleeping: doublePrecision("nights_sleeping").default(0),
  drivesCarers: doublePrecision("drives_carers").default(0),
  millageCarers: doublePrecision("millage_carers").default(0),
  expensesCarers: doublePrecision("expenses_carers").default(0),
  
  // Office Section
  officeOvertime: doublePrecision("office_overtime").default(0),
  officeExpense: doublePrecision("office_expense").default(0),
  officeTravel: doublePrecision("office_travel").default(0),
  officeOncall: doublePrecision("office_oncall").default(0),
  
  // Drivers Section
  drivers: doublePrecision("drivers").default(0),
  
  // Company Overheads Section
  holiday: doublePrecision("holiday").default(0),
  costToEmployer: doublePrecision("cost_to_employer").default(0),
  
  // Invoice Values
  invoiceValues: doublePrecision("invoice_values").default(0),
  
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  uniqueMonth: unique().on(table.reportMonth),
}));

export const insertFinanceReportSchema = createInsertSchema(financeReports).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertFinanceReport = z.infer<typeof insertFinanceReportSchema>;
export type FinanceReport = typeof financeReports.$inferSelect;
