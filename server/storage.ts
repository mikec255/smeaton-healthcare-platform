import { type User, type InsertUser, type Job, type InsertJob, type Application, type InsertApplication, type ContactSubmission, type InsertContactSubmission, type Feedback, type InsertFeedback, type Newsletter, type InsertNewsletter, type NewsletterBlock, type InsertNewsletterBlock, type Template, type InsertTemplate, type Subscriber, type InsertSubscriber, type Campaign, type InsertCampaign, type Delivery, type InsertDelivery, type BlogCategory, type InsertBlogCategory, type BlogPost, type InsertBlogPost, type AuditLog, type InsertAuditLog, type CqcAudit, type InsertCqcAudit, type CqcAuditCategory, type InsertCqcAuditCategory, type CqcQualityStatement, type InsertCqcQualityStatement, type CqcEvidenceCategory, type InsertCqcEvidenceCategory, type CqcAuditEvidence, type InsertCqcAuditEvidence, type CqcQualityAssessment, type InsertCqcQualityAssessment, type CqcComplianceRecord, type InsertCqcComplianceRecord, type CqcChecklistItem, type InsertCqcChecklistItem, type CqcAuditResponse, type InsertCqcAuditResponse, type KnowledgeQuestionnaire, type InsertKnowledgeQuestionnaire, type KnowledgeQuestion, type InsertKnowledgeQuestion, type KnowledgeSession, type InsertKnowledgeSession, type KnowledgeResponse, type InsertKnowledgeResponse, type KnowledgeAction, type InsertKnowledgeAction, type RecruitmentApplication, type InsertRecruitmentApplication, type ProfessionalReference, type InsertProfessionalReference, type FinanceReport, type InsertFinanceReport, type Client, type InsertClient, type Visit, type InsertVisit, type Run, type InsertRun, type RunStop, type InsertRunStop, type Geocode, type InsertGeocode, type ReferenceRequest, type InsertReferenceRequest, type ServiceImprovementPlanItem, type InsertServiceImprovementPlanItem, type UpdateServiceImprovementPlanItem, type CqcFeedbackCampaign, type InsertCqcFeedbackCampaign, type UpdateCqcFeedbackCampaign, type CqcFeedbackResponse, type InsertCqcFeedbackResponse, type AuditScheduleSettings, type InsertAuditScheduleSettings } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { users, jobs, applications, contactSubmissions, blogCategories, blogPosts, auditLogs, cqcAudits, cqcAuditCategories, cqcQualityStatements, cqcEvidenceCategories, cqcAuditEvidence, cqcQualityAssessments, cqcComplianceRecords, knowledgeQuestionnaires, knowledgeQuestions, knowledgeSessions, knowledgeResponses, knowledgeActions, recruitmentApplications, professionalReferences, financeReports, clients, visits, runs, runStops, geocodeCache, referenceRequests, serviceImprovementPlanItems, cqcFeedbackCampaigns, cqcFeedbackResponses, auditScheduleSettings } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import bcrypt from "bcryptjs";

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByPasswordToken(token: string): Promise<User | undefined>;
  setUserPassword(id: string, hashedPassword: string): Promise<void>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  
  // Jobs
  getAllJobs(filters?: { location?: string; type?: string; salaryRange?: string }): Promise<Job[]>;
  getAllJobsForAdmin(filters?: { location?: string; type?: string; salaryRange?: string; status?: string }): Promise<Job[]>;
  getJob(id: string): Promise<Job | undefined>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: string, updates: Partial<InsertJob>): Promise<Job | undefined>;
  deleteJob(id: string): Promise<boolean>;
  
  // Applications
  getAllApplications(): Promise<Application[]>;
  getApplicationsByJobId(jobId: string): Promise<Application[]>;
  getApplication(id: string): Promise<Application | undefined>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplicationStatus(id: string, status: string): Promise<Application | undefined>;
  updateApplicationNotes(id: string, notes: string): Promise<Application | undefined>;
  
  // Recruitment Applications (Full Applications)
  getAllRecruitmentApplications(): Promise<RecruitmentApplication[]>;
  getRecruitmentApplication(id: string): Promise<RecruitmentApplication | undefined>;
  createRecruitmentApplication(application: InsertRecruitmentApplication): Promise<RecruitmentApplication>;
  updateRecruitmentApplicationStatus(id: string, status: string, reviewedBy?: string): Promise<RecruitmentApplication | undefined>;
  updateRecruitmentApplicationNotes(id: string, adminNotes: string): Promise<RecruitmentApplication | undefined>;
  
  // Professional References
  getAllProfessionalReferences(): Promise<ProfessionalReference[]>;
  getProfessionalReference(id: string): Promise<ProfessionalReference | undefined>;
  createProfessionalReference(reference: InsertProfessionalReference): Promise<ProfessionalReference>;
  updateProfessionalReferenceStatus(id: string, status: string, reviewedBy?: string): Promise<ProfessionalReference | undefined>;
  updateProfessionalReferenceNotes(id: string, adminNotes: string): Promise<ProfessionalReference | undefined>;
  
  // Contact submissions
  getAllContactSubmissions(): Promise<ContactSubmission[]>;
  createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission>;
  updateContactSubmissionStatus(id: string, status: string): Promise<ContactSubmission | undefined>;
  
  // Feedback
  getAllFeedback(): Promise<Feedback[]>;
  getFeedback(id: string): Promise<Feedback | undefined>;
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  updateFeedback(id: string, updates: Partial<InsertFeedback>): Promise<Feedback | undefined>;
  deleteFeedback(id: string): Promise<boolean>;
  
  // Newsletters
  getAllNewsletters(): Promise<Newsletter[]>;
  getNewsletter(id: string): Promise<Newsletter | undefined>;
  getNewsletterBySlug(slug: string): Promise<Newsletter | undefined>;
  createNewsletter(newsletter: InsertNewsletter): Promise<Newsletter>;
  updateNewsletter(id: string, updates: Partial<InsertNewsletter>): Promise<Newsletter | undefined>;
  deleteNewsletter(id: string): Promise<boolean>;
  
  // Newsletter blocks
  getNewsletterBlocks(newsletterId: string): Promise<NewsletterBlock[]>;
  getNewsletterBlock(id: string): Promise<NewsletterBlock | undefined>;
  createNewsletterBlock(block: InsertNewsletterBlock): Promise<NewsletterBlock>;
  updateNewsletterBlock(id: string, updates: Partial<InsertNewsletterBlock>): Promise<NewsletterBlock | undefined>;
  deleteNewsletterBlock(id: string): Promise<boolean>;
  deleteNewsletterBlocks(newsletterId: string): Promise<boolean>;
  
  // Templates
  getAllTemplates(): Promise<Template[]>;
  getTemplate(id: string): Promise<Template | undefined>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  updateTemplate(id: string, updates: Partial<InsertTemplate>): Promise<Template | undefined>;
  deleteTemplate(id: string): Promise<boolean>;
  
  // Subscribers
  getAllSubscribers(filters?: { status?: string; source?: string }): Promise<Subscriber[]>;
  getSubscriber(id: string): Promise<Subscriber | undefined>;
  getSubscriberByEmail(email: string): Promise<Subscriber | undefined>;
  createSubscriber(subscriber: InsertSubscriber): Promise<Subscriber>;
  updateSubscriber(id: string, updates: Partial<InsertSubscriber>): Promise<Subscriber | undefined>;
  updateSubscriberStatus(id: string, status: string): Promise<Subscriber | undefined>;
  deleteSubscriber(id: string): Promise<boolean>;
  
  // Campaigns
  getAllCampaigns(): Promise<Campaign[]>;
  getCampaign(id: string): Promise<Campaign | undefined>;
  getCampaignsByNewsletterId(newsletterId: string): Promise<Campaign[]>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: string, updates: Partial<InsertCampaign>): Promise<Campaign | undefined>;
  deleteCampaign(id: string): Promise<boolean>;
  
  // Deliveries
  getDeliveriesByCampaignId(campaignId: string): Promise<Delivery[]>;
  getDelivery(id: string): Promise<Delivery | undefined>;
  createDelivery(delivery: InsertDelivery): Promise<Delivery>;
  updateDelivery(id: string, updates: Partial<InsertDelivery>): Promise<Delivery | undefined>;
  updateDeliveryStatus(id: string, status: string): Promise<Delivery | undefined>;
  deleteDelivery(id: string): Promise<boolean>;
  
  // Blog Categories
  getAllBlogCategories(): Promise<BlogCategory[]>;
  getBlogCategory(id: string): Promise<BlogCategory | undefined>;
  createBlogCategory(category: InsertBlogCategory): Promise<BlogCategory>;
  updateBlogCategory(id: string, updates: Partial<InsertBlogCategory>): Promise<BlogCategory | undefined>;
  deleteBlogCategory(id: string): Promise<boolean>;
  
  // Blog Posts
  getAllBlogPosts(filters?: { categoryId?: string; isPublished?: boolean }): Promise<BlogPost[]>;
  getBlogPost(id: string): Promise<BlogPost | undefined>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: string, updates: Partial<InsertBlogPost>): Promise<BlogPost | undefined>;
  deleteBlogPost(id: string): Promise<boolean>;
  publishBlogPost(id: string): Promise<BlogPost | undefined>;
  incrementBlogPostViews(id: string): Promise<void>;
  
  // GDPR Audit Logging
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(filters?: { userId?: string; resourceType?: string; action?: string; startDate?: Date; endDate?: Date }): Promise<AuditLog[]>;
  getAuditLogsByResourceId(resourceId: string): Promise<AuditLog[]>;
  
  // CQC Audit Management
  getAllCqcAudits(filters?: { auditType?: string; status?: string; auditorId?: string; branch?: string }): Promise<CqcAudit[]>;
  getCqcAudit(id: string): Promise<CqcAudit | undefined>;
  createCqcAudit(audit: InsertCqcAudit): Promise<CqcAudit>;
  updateCqcAudit(id: string, updates: Partial<InsertCqcAudit>): Promise<CqcAudit | undefined>;
  deleteCqcAudit(id: string): Promise<boolean>;
  
  // CQC Audit Categories
  getAllCqcAuditCategories(auditType?: string): Promise<CqcAuditCategory[]>;
  getCqcAuditCategory(id: string): Promise<CqcAuditCategory | undefined>;
  createCqcAuditCategory(category: InsertCqcAuditCategory): Promise<CqcAuditCategory>;
  updateCqcAuditCategory(id: string, updates: Partial<InsertCqcAuditCategory>): Promise<CqcAuditCategory | undefined>;
  deleteCqcAuditCategory(id: string): Promise<boolean>;
  
  // CQC Checklist Items
  getCqcChecklistItems(categoryId?: string): Promise<CqcChecklistItem[]>;
  getCqcChecklistItem(id: string): Promise<CqcChecklistItem | undefined>;
  createCqcChecklistItem(item: InsertCqcChecklistItem): Promise<CqcChecklistItem>;
  updateCqcChecklistItem(id: string, updates: Partial<InsertCqcChecklistItem>): Promise<CqcChecklistItem | undefined>;
  deleteCqcChecklistItem(id: string): Promise<boolean>;
  
  // CQC Audit Responses
  getCqcAuditResponses(auditId: string): Promise<CqcAuditResponse[]>;
  getCqcAuditResponse(id: string): Promise<CqcAuditResponse | undefined>;
  createCqcAuditResponse(response: InsertCqcAuditResponse): Promise<CqcAuditResponse>;
  updateCqcAuditResponse(id: string, updates: Partial<InsertCqcAuditResponse>): Promise<CqcAuditResponse | undefined>;
  deleteCqcAuditResponse(id: string): Promise<boolean>;
  
  // CQC Compliance Records
  getAllCqcComplianceRecords(filters?: { staffId?: string; recordType?: string; status?: string; branch?: string }): Promise<CqcComplianceRecord[]>;
  getCqcComplianceRecord(id: string): Promise<CqcComplianceRecord | undefined>;
  createCqcComplianceRecord(record: InsertCqcComplianceRecord): Promise<CqcComplianceRecord>;
  updateCqcComplianceRecord(id: string, updates: Partial<InsertCqcComplianceRecord>): Promise<CqcComplianceRecord | undefined>;
  deleteCqcComplianceRecord(id: string): Promise<boolean>;

  // CQC 2024 Single Assessment Framework - Quality Statements
  getAllCqcQualityStatements(keyQuestion?: string): Promise<CqcQualityStatement[]>;
  getCqcQualityStatement(id: string): Promise<CqcQualityStatement | undefined>;
  createCqcQualityStatement(statement: InsertCqcQualityStatement): Promise<CqcQualityStatement>;
  updateCqcQualityStatement(id: string, updates: Partial<InsertCqcQualityStatement>): Promise<CqcQualityStatement | undefined>;
  deleteCqcQualityStatement(id: string): Promise<boolean>;

  // CQC 2024 Single Assessment Framework - Evidence Categories
  getAllCqcEvidenceCategories(): Promise<CqcEvidenceCategory[]>;
  getCqcEvidenceCategory(id: string): Promise<CqcEvidenceCategory | undefined>;
  createCqcEvidenceCategory(category: InsertCqcEvidenceCategory): Promise<CqcEvidenceCategory>;
  updateCqcEvidenceCategory(id: string, updates: Partial<InsertCqcEvidenceCategory>): Promise<CqcEvidenceCategory | undefined>;
  deleteCqcEvidenceCategory(id: string): Promise<boolean>;

  // CQC 2024 Single Assessment Framework - Audit Evidence
  getAllCqcAuditEvidence(filters?: { auditId?: string; evidenceCategoryId?: string; qualityStatementId?: string }): Promise<CqcAuditEvidence[]>;
  getCqcAuditEvidence(id: string): Promise<CqcAuditEvidence | undefined>;
  createCqcAuditEvidence(evidence: InsertCqcAuditEvidence): Promise<CqcAuditEvidence>;
  updateCqcAuditEvidence(id: string, updates: Partial<InsertCqcAuditEvidence>): Promise<CqcAuditEvidence | undefined>;
  deleteCqcAuditEvidence(id: string): Promise<boolean>;

  // CQC 2024 Single Assessment Framework - Quality Assessments
  getAllCqcQualityAssessments(filters?: { auditId?: string; qualityStatementId?: string; assessmentRating?: string }): Promise<CqcQualityAssessment[]>;
  getCqcQualityAssessment(id: string): Promise<CqcQualityAssessment | undefined>;
  createCqcQualityAssessment(assessment: InsertCqcQualityAssessment): Promise<CqcQualityAssessment>;
  updateCqcQualityAssessment(id: string, updates: Partial<InsertCqcQualityAssessment>): Promise<CqcQualityAssessment | undefined>;
  deleteCqcQualityAssessment(id: string): Promise<boolean>;

  // Staff Knowledge Assessment Management
  getAllKnowledgeQuestionnaires(filters?: { category?: string; subcategory?: string; isActive?: boolean }): Promise<KnowledgeQuestionnaire[]>;
  getKnowledgeQuestionnaire(id: string): Promise<KnowledgeQuestionnaire | undefined>;
  getKnowledgeQuestionnaireByShareableLink(shareableLink: string): Promise<KnowledgeQuestionnaire | undefined>;
  createKnowledgeQuestionnaire(questionnaire: InsertKnowledgeQuestionnaire): Promise<KnowledgeQuestionnaire>;
  updateKnowledgeQuestionnaire(id: string, updates: Partial<InsertKnowledgeQuestionnaire>): Promise<KnowledgeQuestionnaire | undefined>;
  deleteKnowledgeQuestionnaire(id: string): Promise<boolean>;

  // Knowledge Questions
  getKnowledgeQuestions(questionnaireId: string): Promise<KnowledgeQuestion[]>;
  getKnowledgeQuestion(id: string): Promise<KnowledgeQuestion | undefined>;
  createKnowledgeQuestion(question: InsertKnowledgeQuestion): Promise<KnowledgeQuestion>;
  updateKnowledgeQuestion(id: string, updates: Partial<InsertKnowledgeQuestion>): Promise<KnowledgeQuestion | undefined>;
  deleteKnowledgeQuestion(id: string): Promise<boolean>;

  // Knowledge Sessions
  getAllKnowledgeSessions(filters?: { questionnaireId?: string; staffEmail?: string; status?: string }): Promise<KnowledgeSession[]>;
  getKnowledgeSession(id: string): Promise<KnowledgeSession | undefined>;
  createKnowledgeSession(session: InsertKnowledgeSession): Promise<KnowledgeSession>;
  updateKnowledgeSession(id: string, updates: Partial<InsertKnowledgeSession>): Promise<KnowledgeSession | undefined>;
  deleteKnowledgeSession(id: string): Promise<boolean>;

  // Knowledge Responses
  getKnowledgeResponses(sessionId: string): Promise<KnowledgeResponse[]>;
  getKnowledgeResponse(id: string): Promise<KnowledgeResponse | undefined>;
  createKnowledgeResponse(response: InsertKnowledgeResponse): Promise<KnowledgeResponse>;
  updateKnowledgeResponse(id: string, updates: Partial<InsertKnowledgeResponse>): Promise<KnowledgeResponse | undefined>;
  deleteKnowledgeResponse(id: string): Promise<boolean>;

  // Knowledge Actions
  getAllKnowledgeActions(filters?: { sessionId?: string; assignedTo?: string; status?: string }): Promise<KnowledgeAction[]>;
  getKnowledgeAction(id: string): Promise<KnowledgeAction | undefined>;
  createKnowledgeAction(action: InsertKnowledgeAction): Promise<KnowledgeAction>;
  updateKnowledgeAction(id: string, updates: Partial<InsertKnowledgeAction>): Promise<KnowledgeAction | undefined>;
  deleteKnowledgeAction(id: string): Promise<boolean>;

  // Finance Reports
  getAllFinanceReports(): Promise<FinanceReport[]>;
  getFinanceReport(id: string): Promise<FinanceReport | undefined>;
  getFinanceReportByMonth(reportMonth: string): Promise<FinanceReport | undefined>;
  createFinanceReport(report: InsertFinanceReport): Promise<FinanceReport>;
  updateFinanceReport(id: string, updates: Partial<InsertFinanceReport>): Promise<FinanceReport | undefined>;
  deleteFinanceReport(id: string): Promise<boolean>;
  
  // Route Planning - Clients
  getAllClients(filters?: { isActive?: boolean; postcode?: string }): Promise<Client[]>;
  getClient(id: string): Promise<Client | undefined>;
  getClientByPostcode(postcode: string): Promise<Client[]>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: string, updates: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: string): Promise<boolean>;

  // Route Planning - Visits
  getAllVisits(filters?: { date?: string; clientId?: string; timeSlot?: string; status?: string }): Promise<Visit[]>;
  getVisitsByDate(date: string): Promise<Visit[]>;
  getVisitsByClientId(clientId: string): Promise<Visit[]>;
  getVisit(id: string): Promise<Visit | undefined>;
  createVisit(visit: InsertVisit): Promise<Visit>;
  updateVisit(id: string, updates: Partial<InsertVisit>): Promise<Visit | undefined>;
  deleteVisit(id: string): Promise<boolean>;

  // Route Planning - Runs
  getAllRuns(filters?: { date?: string; travelMode?: string; status?: string; createdBy?: string }): Promise<Run[]>;
  getRunsByDate(date: string): Promise<Run[]>;
  getRun(id: string): Promise<Run | undefined>;
  createRun(run: InsertRun): Promise<Run>;
  updateRun(id: string, updates: Partial<InsertRun>): Promise<Run | undefined>;
  deleteRun(id: string): Promise<boolean>;

  // Route Planning - Run Stops
  getRunStops(runId: string): Promise<RunStop[]>;
  getRunStop(id: string): Promise<RunStop | undefined>;
  createRunStop(runStop: InsertRunStop): Promise<RunStop>;
  updateRunStop(id: string, updates: Partial<InsertRunStop>): Promise<RunStop | undefined>;
  deleteRunStop(id: string): Promise<boolean>;
  deleteRunStops(runId: string): Promise<boolean>;

  // Route Planning - Geocoding Cache
  getGeocode(address: string): Promise<Geocode | undefined>;
  createGeocode(geocode: InsertGeocode): Promise<Geocode>;
  updateGeocode(id: string, updates: Partial<InsertGeocode>): Promise<Geocode | undefined>;
  
  // Reference Requests
  getAllReferenceRequests(filters?: { status?: string }): Promise<ReferenceRequest[]>;
  getReferenceRequest(id: string): Promise<ReferenceRequest | undefined>;
  getReferenceRequestByToken(token: string): Promise<ReferenceRequest | undefined>;
  createReferenceRequest(request: InsertReferenceRequest): Promise<ReferenceRequest>;
  updateReferenceRequest(id: string, updates: Partial<InsertReferenceRequest>): Promise<ReferenceRequest | undefined>;
  updateReferenceRequestStatus(id: string, status: string): Promise<ReferenceRequest | undefined>;
  deleteReferenceRequest(id: string): Promise<boolean>;
  
  // Service Improvement Plan (SIP)
  getAllServiceImprovementPlanItems(filters?: { status?: string; priority?: string; cqcDomain?: string; branch?: string }): Promise<ServiceImprovementPlanItem[]>;
  getServiceImprovementPlanItem(id: string): Promise<ServiceImprovementPlanItem | undefined>;
  createServiceImprovementPlanItem(item: InsertServiceImprovementPlanItem): Promise<ServiceImprovementPlanItem>;
  updateServiceImprovementPlanItem(id: string, updates: UpdateServiceImprovementPlanItem): Promise<ServiceImprovementPlanItem | undefined>;
  completeServiceImprovementPlanItem(id: string, completedBy: string): Promise<ServiceImprovementPlanItem | undefined>;
  deleteServiceImprovementPlanItem(id: string): Promise<boolean>;
  getNextSipReferenceNumber(): Promise<string>;
  
  // CQC Feedback Campaigns
  getAllCqcFeedbackCampaigns(filters?: { category?: string; status?: string; branch?: string }): Promise<CqcFeedbackCampaign[]>;
  getCqcFeedbackCampaign(id: string): Promise<CqcFeedbackCampaign | undefined>;
  getCqcFeedbackCampaignByToken(token: string): Promise<CqcFeedbackCampaign | undefined>;
  createCqcFeedbackCampaign(campaign: InsertCqcFeedbackCampaign): Promise<CqcFeedbackCampaign>;
  updateCqcFeedbackCampaign(id: string, updates: UpdateCqcFeedbackCampaign): Promise<CqcFeedbackCampaign | undefined>;
  deleteCqcFeedbackCampaign(id: string): Promise<boolean>;
  
  // CQC Feedback Responses
  getAllCqcFeedbackResponses(filters?: { campaignId?: string; branch?: string; source?: string; status?: string }): Promise<CqcFeedbackResponse[]>;
  getCqcFeedbackResponse(id: string): Promise<CqcFeedbackResponse | undefined>;
  createCqcFeedbackResponse(response: InsertCqcFeedbackResponse): Promise<CqcFeedbackResponse>;
  updateCqcFeedbackResponse(id: string, updates: Partial<InsertCqcFeedbackResponse>): Promise<CqcFeedbackResponse | undefined>;
  deleteCqcFeedbackResponse(id: string): Promise<boolean>;
  getCqcFeedbackCampaignStats(campaignId: string): Promise<{
    totalResponses: number;
    averageRating: number;
    npsScore: number;
    ratingDistribution: Record<number, number>;
    recommendPercentage: number;
  }>;
  
  // Audit Schedule Settings
  getAllAuditScheduleSettings(filters?: { branch?: string }): Promise<AuditScheduleSettings[]>;
  getAuditScheduleSettings(id: string): Promise<AuditScheduleSettings | undefined>;
  getAuditScheduleSettingsByCategory(category: string, branch: string): Promise<AuditScheduleSettings | undefined>;
  createAuditScheduleSettings(settings: InsertAuditScheduleSettings): Promise<AuditScheduleSettings>;
  updateAuditScheduleSettings(id: string, updates: Partial<InsertAuditScheduleSettings>): Promise<AuditScheduleSettings | undefined>;
  upsertAuditScheduleSettings(settings: InsertAuditScheduleSettings): Promise<AuditScheduleSettings>;
  deleteAuditScheduleSettings(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private jobs: Map<string, Job>;
  private applications: Map<string, Application>;
  private recruitmentApplications: Map<string, RecruitmentApplication>;
  private professionalReferences: Map<string, ProfessionalReference>;
  private contactSubmissions: Map<string, ContactSubmission>;
  private feedback: Map<string, Feedback>;
  private newsletters: Map<string, Newsletter>;
  private newsletterBlocks: Map<string, NewsletterBlock>;
  private templates: Map<string, Template>;
  private subscribers: Map<string, Subscriber>;
  private campaigns: Map<string, Campaign>;
  private deliveries: Map<string, Delivery>;
  private blogCategories: Map<string, BlogCategory>;
  private blogPosts: Map<string, BlogPost>;
  private auditLogs: Map<string, AuditLog>;
  private cqcAudits: Map<string, CqcAudit>;
  private cqcAuditCategories: Map<string, CqcAuditCategory>;
  private cqcChecklistItems: Map<string, CqcChecklistItem>;
  private cqcAuditResponses: Map<string, CqcAuditResponse>;
  private cqcComplianceRecords: Map<string, CqcComplianceRecord>;
  private knowledgeQuestionnaires: Map<string, KnowledgeQuestionnaire>;
  private knowledgeQuestions: Map<string, KnowledgeQuestion>;
  private knowledgeSessions: Map<string, KnowledgeSession>;
  private knowledgeResponses: Map<string, KnowledgeResponse>;
  private knowledgeActions: Map<string, KnowledgeAction>;
  private clients: Map<string, Client>;
  private visits: Map<string, Visit>;
  private runs: Map<string, Run>;
  private runStops: Map<string, RunStop>;
  private geocodes: Map<string, Geocode>;
  private referenceRequests: Map<string, ReferenceRequest>;
  private sipItems: Map<string, ServiceImprovementPlanItem>;

  constructor() {
    this.users = new Map();
    this.jobs = new Map();
    this.applications = new Map();
    this.recruitmentApplications = new Map();
    this.professionalReferences = new Map();
    this.contactSubmissions = new Map();
    this.feedback = new Map();
    this.newsletters = new Map();
    this.newsletterBlocks = new Map();
    this.templates = new Map();
    this.subscribers = new Map();
    this.campaigns = new Map();
    this.deliveries = new Map();
    this.blogCategories = new Map();
    this.blogPosts = new Map();
    this.auditLogs = new Map();
    this.cqcAudits = new Map();
    this.cqcAuditCategories = new Map();
    this.cqcChecklistItems = new Map();
    this.cqcAuditResponses = new Map();
    this.cqcComplianceRecords = new Map();
    this.knowledgeQuestionnaires = new Map();
    this.knowledgeQuestions = new Map();
    this.knowledgeSessions = new Map();
    this.knowledgeResponses = new Map();
    this.knowledgeActions = new Map();
    this.clients = new Map();
    this.visits = new Map();
    this.runs = new Map();
    this.runStops = new Map();
    this.geocodes = new Map();
    this.referenceRequests = new Map();
    this.sipItems = new Map();
    
    // Initialize with sample jobs from the website
    this.initializeSampleJobs();
  }

  private initializeSampleJobs() {
    const sampleJobs: Job[] = [
      {
        id: randomUUID(),
        title: "Service Manager",
        type: "permanent",
        location: "Plymouth",
        branch: "Plymouth",
        department: "Care at Home",
        salaryType: "annual",
        salaryMin: 28600,
        salaryMax: null,
        summary: "As a Service Manager at Smeaton Healthcare, you will play a vital role in overseeing our care at home operations and ensuring exceptional service delivery.",
        description: "Position: Service Manager\nReports to: Registered Manager (Head of Operations)\nLocation: Head Office, Plymouth\n\nJob Summary: As a Service Manager at Smeaton Healthcare, you will play a vital role in overseeing our care at home operations and ensuring exceptional service delivery to our clients across Plymouth and surrounding areas.\n\nKey Responsibilities:\n- Oversee daily operations of care at home services\n- Manage and support a team of care assistants\n- Ensure compliance with CQC regulations and standards\n- Conduct care plan reviews and assessments\n- Liaise with families, healthcare professionals, and stakeholders\n- Monitor service quality and implement improvements",
        requirements: "Previous management experience in healthcare or care sector\nUnderstanding of care regulations and best practices\nStrong leadership and communication skills\nAbility to work under pressure and manage multiple priorities\nFull UK driving license",
        benefits: "Competitive salary\nComprehensive training\nCareer development opportunities\nSupportive team environment\nFlexible working arrangements",
        reportsTo: "Registered Manager (Head of Operations)",
        experienceLevel: "3-5-years",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        title: "Homecare Assistant",
        type: "care-at-home",
        location: "Devon & Cornwall",
        branch: "Multi-Location",
        department: "Care at Home",
        salaryType: "hourly",
        salaryMin: 1150, // £11.50 in pence
        salaryMax: 1300, // £13.00 in pence
        summary: "We are looking for compassionate and dedicated Homecare Assistants to join our team providing high-quality care in clients' homes.",
        description: "Smeaton Healthcare are looking for passionate Homecare Assistants to join our existing care at home team. We're a proud healthcare company with our staff & customers at the heart of what we do.\n\nKey Responsibilities:\n- Provide personal care assistance to clients in their homes\n- Assist with daily living activities and household tasks\n- Provide companionship and emotional support\n- Follow care plans and maintain accurate records\n- Communicate effectively with families and healthcare professionals\n- Ensure client safety and dignity at all times",
        requirements: "Previous experience in care or healthcare preferred\nCompassionate and patient-centered approach\nExcellent communication and interpersonal skills\nReliability and punctuality\nFull UK driving license preferred\nFlexibility to work various hours",
        benefits: "Competitive hourly rates\nTravel time and mileage paid\nFlexible working arrangements\nComprehensive training and support\nCareer development opportunities",
        reportsTo: "Service Manager",
        experienceLevel: "entry",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        title: "Live-in Care",
        type: "care-at-home",
        location: "Various Locations",
        branch: "Multi-Location",
        department: "Care at Home",
        salaryType: "weekly",
        salaryMin: 80000, // £800 in pence
        salaryMax: 100000, // £1000 in pence
        summary: "Join our compassionate team as a Live-In Carer providing 24/7 support and companionship to clients in their own homes.",
        description: "Passionate about Healthcare? Join Our Compassionate Team at Smeaton Healthcare!\n\nAre you ready to make a real difference in someone's life? We're seeking dedicated Live-In Carers to provide compassionate support and companionship to clients in the comfort of their own homes.\n\nKey Responsibilities:\n- Provide 24/7 care and support to clients\n- Assist with personal care, medication, and daily activities\n- Provide companionship and emotional support\n- Maintain a safe and comfortable home environment\n- Communicate regularly with families and healthcare professionals\n- Follow individualized care plans",
        requirements: "Previous experience in care or healthcare\nCompassionate and patient approach\nAbility to live away from home for extended periods\nExcellent communication skills\nFlexibility and adaptability\nClean DBS check required",
        benefits: "Excellent weekly rates (£800-£1000)\nAccommodation and meals provided\nTravel expenses covered\nComprehensive training and support\nMeaningful and rewarding work",
        reportsTo: "Service Manager",
        experienceLevel: "1-2-years",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    sampleJobs.forEach(job => {
      this.jobs.set(job.id, job);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByPasswordToken(token: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.passwordToken === token,
    );
  }

  async setUserPassword(id: string, hashedPassword: string): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      this.users.set(id, {
        ...user,
        password: hashedPassword,
        passwordToken: null,
        tokenExpiresAt: null,
      });
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      id,
      username: insertUser.username,
      password: insertUser.password || null,
      passwordToken: insertUser.passwordToken || null,
      tokenExpiresAt: insertUser.tokenExpiresAt || null,
      role: insertUser.role || "admin",
      isActive: insertUser.isActive ?? true,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values()).sort((a, b) => 
      (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      ...updates,
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  async getAllJobs(filters?: { location?: string; type?: string; salaryRange?: string }): Promise<Job[]> {
    let jobs = Array.from(this.jobs.values()).filter(job => job.isActive);
    
    if (filters?.location) {
      jobs = jobs.filter(job => 
        job.location.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }
    
    if (filters?.type) {
      jobs = jobs.filter(job => job.type === filters.type);
    }
    
    if (filters?.salaryRange) {
      const [min, max] = filters.salaryRange.split('-').map(Number);
      jobs = jobs.filter(job => {
        const jobSalary = job.salaryMin;
        return jobSalary >= (min * 100) && (!max || jobSalary <= (max * 100));
      });
    }
    
    return jobs.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getAllJobsForAdmin(filters?: { location?: string; type?: string; salaryRange?: string; status?: string }): Promise<Job[]> {
    let jobs = Array.from(this.jobs.values());
    
    if (filters?.status) {
      if (filters.status === "active") {
        jobs = jobs.filter(job => job.isActive);
      } else if (filters.status === "inactive") {
        jobs = jobs.filter(job => !job.isActive);
      }
      // "all" shows both active and inactive
    }
    
    if (filters?.location) {
      jobs = jobs.filter(job => 
        job.location.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }
    
    if (filters?.type) {
      jobs = jobs.filter(job => job.type === filters.type);
    }
    
    if (filters?.salaryRange) {
      const [min, max] = filters.salaryRange.split('-').map(Number);
      jobs = jobs.filter(job => {
        const jobSalary = job.salaryMin;
        return jobSalary >= (min * 100) && (!max || jobSalary <= (max * 100));
      });
    }
    
    return jobs.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getJob(id: string): Promise<Job | undefined> {
    return this.jobs.get(id);
  }

  async createJob(jobData: InsertJob): Promise<Job> {
    const id = randomUUID();
    const job: Job = {
      ...jobData,
      id,
      department: jobData.department || null,
      branch: jobData.branch,
      salaryMax: jobData.salaryMax || null,
      requirements: jobData.requirements || null,
      benefits: jobData.benefits || null,
      reportsTo: jobData.reportsTo || null,
      experienceLevel: jobData.experienceLevel || null,
      isActive: jobData.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.jobs.set(id, job);
    return job;
  }

  async updateJob(id: string, updates: Partial<InsertJob>): Promise<Job | undefined> {
    const job = this.jobs.get(id);
    if (!job) return undefined;
    
    const updatedJob: Job = {
      ...job,
      ...updates,
      updatedAt: new Date(),
    };
    this.jobs.set(id, updatedJob);
    return updatedJob;
  }

  async deleteJob(id: string): Promise<boolean> {
    return this.jobs.delete(id);
  }

  async getAllApplications(): Promise<Application[]> {
    return Array.from(this.applications.values())
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getApplicationsByJobId(jobId: string): Promise<Application[]> {
    return Array.from(this.applications.values())
      .filter(app => app.jobId === jobId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getApplication(id: string): Promise<Application | undefined> {
    return this.applications.get(id);
  }

  async createApplication(applicationData: InsertApplication): Promise<Application> {
    const id = randomUUID();
    const application: Application = {
      ...applicationData,
      id,
      cvPath: applicationData.cvPath || null,
      experience: applicationData.experience || null,
      additionalInfo: applicationData.additionalInfo || null,
      status: applicationData.status || "pending",
      notes: applicationData.notes || null,
      referralSource: applicationData.referralSource || null,
      createdAt: new Date(),
    };
    this.applications.set(id, application);
    return application;
  }

  async updateApplicationStatus(id: string, status: string): Promise<Application | undefined> {
    const application = this.applications.get(id);
    if (!application) return undefined;
    
    const updatedApplication: Application = {
      ...application,
      status,
    };
    this.applications.set(id, updatedApplication);
    return updatedApplication;
  }

  async updateApplicationNotes(id: string, notes: string): Promise<Application | undefined> {
    const application = this.applications.get(id);
    if (!application) return undefined;
    
    const updatedApplication: Application = {
      ...application,
      notes,
    };
    this.applications.set(id, updatedApplication);
    return updatedApplication;
  }

  // Recruitment Applications (Full Applications) - MemStorage
  async getAllRecruitmentApplications(): Promise<RecruitmentApplication[]> {
    return Array.from(this.recruitmentApplications.values())
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getRecruitmentApplication(id: string): Promise<RecruitmentApplication | undefined> {
    return this.recruitmentApplications.get(id);
  }

  async createRecruitmentApplication(application: InsertRecruitmentApplication): Promise<RecruitmentApplication> {
    const id = randomUUID();
    const now = new Date();
    const newApplication: RecruitmentApplication = {
      id,
      ...application,
      createdAt: now,
      updatedAt: now,
    };
    this.recruitmentApplications.set(id, newApplication);
    return newApplication;
  }

  async updateRecruitmentApplicationStatus(id: string, status: string, reviewedBy?: string): Promise<RecruitmentApplication | undefined> {
    const application = this.recruitmentApplications.get(id);
    if (!application) return undefined;
    
    const now = new Date();
    const updatedApplication: RecruitmentApplication = {
      ...application,
      status,
      reviewedBy: reviewedBy || null,
      reviewedAt: reviewedBy ? now : null,
      updatedAt: now,
    };
    this.recruitmentApplications.set(id, updatedApplication);
    return updatedApplication;
  }

  async updateRecruitmentApplicationNotes(id: string, adminNotes: string): Promise<RecruitmentApplication | undefined> {
    const application = this.recruitmentApplications.get(id);
    if (!application) return undefined;
    
    const updatedApplication: RecruitmentApplication = {
      ...application,
      adminNotes,
      updatedAt: new Date(),
    };
    this.recruitmentApplications.set(id, updatedApplication);
    return updatedApplication;
  }

  // Professional References - MemStorage
  async getAllProfessionalReferences(): Promise<ProfessionalReference[]> {
    return Array.from(this.professionalReferences.values())
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getProfessionalReference(id: string): Promise<ProfessionalReference | undefined> {
    return this.professionalReferences.get(id);
  }

  async createProfessionalReference(reference: InsertProfessionalReference): Promise<ProfessionalReference> {
    const id = randomUUID();
    const now = new Date();
    const newReference: ProfessionalReference = {
      id,
      ...reference,
      createdAt: now,
      updatedAt: now,
    };
    this.professionalReferences.set(id, newReference);
    return newReference;
  }

  async updateProfessionalReferenceStatus(id: string, status: string, reviewedBy?: string): Promise<ProfessionalReference | undefined> {
    const reference = this.professionalReferences.get(id);
    if (!reference) return undefined;
    
    const now = new Date();
    const updatedReference: ProfessionalReference = {
      ...reference,
      status,
      reviewedBy: reviewedBy || null,
      reviewedAt: reviewedBy ? now : null,
      updatedAt: now,
    };
    this.professionalReferences.set(id, updatedReference);
    return updatedReference;
  }

  async updateProfessionalReferenceNotes(id: string, adminNotes: string): Promise<ProfessionalReference | undefined> {
    const reference = this.professionalReferences.get(id);
    if (!reference) return undefined;
    
    const updatedReference: ProfessionalReference = {
      ...reference,
      adminNotes,
      updatedAt: new Date(),
    };
    this.professionalReferences.set(id, updatedReference);
    return updatedReference;
  }

  async getAllContactSubmissions(): Promise<ContactSubmission[]> {
    return Array.from(this.contactSubmissions.values())
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async createContactSubmission(submissionData: InsertContactSubmission): Promise<ContactSubmission> {
    const id = randomUUID();
    const submission: ContactSubmission = {
      ...submissionData,
      id,
      firstName: submissionData.firstName || null,
      lastName: submissionData.lastName || null,
      contactName: submissionData.contactName || null,
      organization: submissionData.organization || null,
      serviceRequired: submissionData.serviceRequired || null,
      staffType: submissionData.staffType || null,
      numberOfStaff: submissionData.numberOfStaff || null,
      duration: submissionData.duration || null,
      careRequirements: submissionData.careRequirements || null,
      additionalRequirements: submissionData.additionalRequirements || null,
      preferredStartDate: submissionData.preferredStartDate || null,
      status: submissionData.status || "new",
      createdAt: new Date(),
    };
    this.contactSubmissions.set(id, submission);
    return submission;
  }

  async updateContactSubmissionStatus(id: string, status: string): Promise<ContactSubmission | undefined> {
    const submission = this.contactSubmissions.get(id);
    if (!submission) {
      return undefined;
    }
    
    const updatedSubmission = { ...submission, status };
    this.contactSubmissions.set(id, updatedSubmission);
    return updatedSubmission;
  }

  // Feedback methods
  async getAllFeedback(): Promise<Feedback[]> {
    return Array.from(this.feedback.values())
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getFeedback(id: string): Promise<Feedback | undefined> {
    return this.feedback.get(id);
  }

  async createFeedback(feedbackData: InsertFeedback): Promise<Feedback> {
    const id = randomUUID();
    const feedback: Feedback = {
      ...feedbackData,
      id,
      phone: feedbackData.phone || null,
      relationship: feedbackData.relationship || null,
      serviceUsed: feedbackData.serviceUsed || null,
      location: feedbackData.location || null,
      qualityRating: feedbackData.qualityRating || null,
      communicationRating: feedbackData.communicationRating || null,
      timelynessRating: feedbackData.timelynessRating || null,
      professionalismRating: feedbackData.professionalismRating || null,
      positiveAspects: feedbackData.positiveAspects || null,
      improvementAreas: feedbackData.improvementAreas || null,
      additionalComments: feedbackData.additionalComments || null,
      consentToContact: feedbackData.consentToContact || false,
      consentToPublish: feedbackData.consentToPublish || false,
      status: feedbackData.status || "new",
      adminNotes: null,
      responseDate: null,
      createdAt: new Date(),
    };
    this.feedback.set(id, feedback);
    return feedback;
  }

  async updateFeedback(id: string, updates: Partial<InsertFeedback>): Promise<Feedback | undefined> {
    const feedback = this.feedback.get(id);
    if (!feedback) return undefined;
    
    const updatedFeedback: Feedback = {
      ...feedback,
      ...updates,
    };
    this.feedback.set(id, updatedFeedback);
    return updatedFeedback;
  }

  async deleteFeedback(id: string): Promise<boolean> {
    return this.feedback.delete(id);
  }

  // Newsletter methods
  async getAllNewsletters(): Promise<Newsletter[]> {
    return Array.from(this.newsletters.values())
      .sort((a, b) => (b.updatedAt?.getTime() || 0) - (a.updatedAt?.getTime() || 0));
  }

  async getNewsletter(id: string): Promise<Newsletter | undefined> {
    return this.newsletters.get(id);
  }

  async getNewsletterBySlug(slug: string): Promise<Newsletter | undefined> {
    return Array.from(this.newsletters.values()).find(newsletter => newsletter.slug === slug);
  }

  async createNewsletter(newsletterData: InsertNewsletter): Promise<Newsletter> {
    const id = randomUUID();
    const newsletter: Newsletter = {
      ...newsletterData,
      id,
      subject: newsletterData.subject || null,
      preheader: newsletterData.preheader || null,
      status: newsletterData.status || "draft",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.newsletters.set(id, newsletter);
    return newsletter;
  }

  async updateNewsletter(id: string, updates: Partial<InsertNewsletter>): Promise<Newsletter | undefined> {
    const newsletter = this.newsletters.get(id);
    if (!newsletter) return undefined;
    
    const updatedNewsletter: Newsletter = {
      ...newsletter,
      ...updates,
      updatedAt: new Date(),
    };
    this.newsletters.set(id, updatedNewsletter);
    return updatedNewsletter;
  }

  async deleteNewsletter(id: string): Promise<boolean> {
    // Delete associated blocks and campaigns first
    await this.deleteNewsletterBlocks(id);
    const campaigns = Array.from(this.campaigns.values()).filter(c => c.newsletterId === id);
    campaigns.forEach(c => this.deleteCampaign(c.id));
    
    return this.newsletters.delete(id);
  }

  // Newsletter block methods
  async getNewsletterBlocks(newsletterId: string): Promise<NewsletterBlock[]> {
    return Array.from(this.newsletterBlocks.values())
      .filter(block => block.newsletterId === newsletterId)
      .sort((a, b) => a.position - b.position);
  }

  async getNewsletterBlock(id: string): Promise<NewsletterBlock | undefined> {
    return this.newsletterBlocks.get(id);
  }

  async createNewsletterBlock(blockData: InsertNewsletterBlock): Promise<NewsletterBlock> {
    const id = randomUUID();
    const block: NewsletterBlock = {
      ...blockData,
      id,
      content: blockData.content as Record<string, any> | null || null,
      parentId: blockData.parentId || null,
    };
    this.newsletterBlocks.set(id, block);
    return block;
  }

  async updateNewsletterBlock(id: string, updates: Partial<InsertNewsletterBlock>): Promise<NewsletterBlock | undefined> {
    const block = this.newsletterBlocks.get(id);
    if (!block) return undefined;
    
    const updatedBlock: NewsletterBlock = {
      ...block,
      ...updates,
    };
    this.newsletterBlocks.set(id, updatedBlock);
    return updatedBlock;
  }

  async deleteNewsletterBlock(id: string): Promise<boolean> {
    // Delete child blocks first
    const childBlocks = Array.from(this.newsletterBlocks.values()).filter(block => block.parentId === id);
    childBlocks.forEach(childBlock => this.newsletterBlocks.delete(childBlock.id));
    
    return this.newsletterBlocks.delete(id);
  }

  async deleteNewsletterBlocks(newsletterId: string): Promise<boolean> {
    const blocksToDelete = Array.from(this.newsletterBlocks.values()).filter(block => block.newsletterId === newsletterId);
    blocksToDelete.forEach(block => this.newsletterBlocks.delete(block.id));
    return true;
  }

  // Template methods
  async getAllTemplates(): Promise<Template[]> {
    return Array.from(this.templates.values())
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getTemplate(id: string): Promise<Template | undefined> {
    return this.templates.get(id);
  }

  async createTemplate(templateData: InsertTemplate): Promise<Template> {
    const id = randomUUID();
    const template: Template = {
      ...templateData,
      id,
      description: templateData.description || null,
      blocks: templateData.blocks as Array<Record<string, any>> | null || null,
      isDefault: templateData.isDefault || false,
      createdAt: new Date(),
    };
    this.templates.set(id, template);
    return template;
  }

  async updateTemplate(id: string, updates: Partial<InsertTemplate>): Promise<Template | undefined> {
    const template = this.templates.get(id);
    if (!template) return undefined;
    
    const updatedTemplate: Template = {
      ...template,
      ...updates,
      blocks: updates.blocks !== undefined ? (updates.blocks as Array<Record<string, any>> | null) : template.blocks,
    };
    this.templates.set(id, updatedTemplate);
    return updatedTemplate;
  }

  async deleteTemplate(id: string): Promise<boolean> {
    return this.templates.delete(id);
  }

  // Subscriber methods
  async getAllSubscribers(filters?: { status?: string; source?: string }): Promise<Subscriber[]> {
    let subscribers = Array.from(this.subscribers.values());
    
    if (filters?.status) {
      subscribers = subscribers.filter(sub => sub.status === filters.status);
    }
    
    if (filters?.source) {
      subscribers = subscribers.filter(sub => sub.source === filters.source);
    }
    
    return subscribers.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getSubscriber(id: string): Promise<Subscriber | undefined> {
    return this.subscribers.get(id);
  }

  async getSubscriberByEmail(email: string): Promise<Subscriber | undefined> {
    return Array.from(this.subscribers.values()).find(subscriber => subscriber.email === email);
  }

  async createSubscriber(subscriberData: InsertSubscriber): Promise<Subscriber> {
    const id = randomUUID();
    const subscriber: Subscriber = {
      ...subscriberData,
      id,
      firstName: subscriberData.firstName || null,
      lastName: subscriberData.lastName || null,
      status: subscriberData.status || "pending",
      preferences: subscriberData.preferences as Record<string, any> | null || null,
      source: subscriberData.source || null,
      consentAt: subscriberData.consentAt || null,
      consentIp: subscriberData.consentIp || null,
      unsubscribeAt: subscriberData.unsubscribeAt || null,
      createdAt: new Date(),
    };
    this.subscribers.set(id, subscriber);
    return subscriber;
  }

  async updateSubscriber(id: string, updates: Partial<InsertSubscriber>): Promise<Subscriber | undefined> {
    const subscriber = this.subscribers.get(id);
    if (!subscriber) return undefined;
    
    const updatedSubscriber: Subscriber = {
      ...subscriber,
      ...updates,
    };
    this.subscribers.set(id, updatedSubscriber);
    return updatedSubscriber;
  }

  async updateSubscriberStatus(id: string, status: string): Promise<Subscriber | undefined> {
    const subscriber = this.subscribers.get(id);
    if (!subscriber) return undefined;
    
    const updates: Partial<Subscriber> = { status };
    if (status === "unsubscribed") {
      updates.unsubscribeAt = new Date();
    }
    
    const updatedSubscriber: Subscriber = {
      ...subscriber,
      ...updates,
    };
    this.subscribers.set(id, updatedSubscriber);
    return updatedSubscriber;
  }

  async deleteSubscriber(id: string): Promise<boolean> {
    // Delete associated deliveries first
    const deliveriesToDelete = Array.from(this.deliveries.values()).filter(d => d.subscriberId === id);
    deliveriesToDelete.forEach(delivery => this.deliveries.delete(delivery.id));
    
    return this.subscribers.delete(id);
  }

  // Campaign methods
  async getAllCampaigns(): Promise<Campaign[]> {
    return Array.from(this.campaigns.values())
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getCampaign(id: string): Promise<Campaign | undefined> {
    return this.campaigns.get(id);
  }

  async getCampaignsByNewsletterId(newsletterId: string): Promise<Campaign[]> {
    return Array.from(this.campaigns.values())
      .filter(campaign => campaign.newsletterId === newsletterId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async createCampaign(campaignData: InsertCampaign): Promise<Campaign> {
    const id = randomUUID();
    const campaign: Campaign = {
      ...campaignData,
      id,
      segment: campaignData.segment as Record<string, any> | null || null,
      scheduledAt: campaignData.scheduledAt || null,
      sentAt: campaignData.sentAt || null,
      status: campaignData.status || "draft",
      metrics: campaignData.metrics as {
        totalRecipients?: number;
        sent?: number;
        bounced?: number;
        opened?: number;
        clicked?: number;
        unsubscribed?: number;
        complained?: number;
        openRate?: number;
        clickRate?: number;
      } | null || null,
      createdAt: new Date(),
    };
    this.campaigns.set(id, campaign);
    return campaign;
  }

  async updateCampaign(id: string, updates: Partial<InsertCampaign>): Promise<Campaign | undefined> {
    const campaign = this.campaigns.get(id);
    if (!campaign) return undefined;
    
    const updatedCampaign: Campaign = {
      ...campaign,
      ...updates,
      metrics: updates.metrics !== undefined ? (updates.metrics as {
        totalRecipients?: number;
        sent?: number;
        bounced?: number;
        opened?: number;
        clicked?: number;
        unsubscribed?: number;
        complained?: number;
        openRate?: number;
        clickRate?: number;
      } | null) : campaign.metrics,
      segment: updates.segment !== undefined ? (updates.segment as Record<string, any> | null) : campaign.segment,
    };
    this.campaigns.set(id, updatedCampaign);
    return updatedCampaign;
  }

  async deleteCampaign(id: string): Promise<boolean> {
    // Delete associated deliveries first
    const deliveriesToDelete = Array.from(this.deliveries.values()).filter(d => d.campaignId === id);
    deliveriesToDelete.forEach(delivery => this.deliveries.delete(delivery.id));
    
    return this.campaigns.delete(id);
  }

  // Delivery methods
  async getDeliveriesByCampaignId(campaignId: string): Promise<Delivery[]> {
    return Array.from(this.deliveries.values())
      .filter(delivery => delivery.campaignId === campaignId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getDelivery(id: string): Promise<Delivery | undefined> {
    return this.deliveries.get(id);
  }

  async createDelivery(deliveryData: InsertDelivery): Promise<Delivery> {
    const id = randomUUID();
    const delivery: Delivery = {
      ...deliveryData,
      id,
      status: deliveryData.status || "queued",
      messageId: deliveryData.messageId || null,
      openCount: deliveryData.openCount || 0,
      clickCount: deliveryData.clickCount || 0,
      lastEventAt: deliveryData.lastEventAt || null,
      tokenHash: deliveryData.tokenHash || null,
      createdAt: new Date(),
    };
    this.deliveries.set(id, delivery);
    return delivery;
  }

  async updateDelivery(id: string, updates: Partial<InsertDelivery>): Promise<Delivery | undefined> {
    const delivery = this.deliveries.get(id);
    if (!delivery) return undefined;
    
    const updatedDelivery: Delivery = {
      ...delivery,
      ...updates,
      lastEventAt: new Date(),
    };
    this.deliveries.set(id, updatedDelivery);
    return updatedDelivery;
  }

  async updateDeliveryStatus(id: string, status: string): Promise<Delivery | undefined> {
    return this.updateDelivery(id, { status });
  }

  async deleteDelivery(id: string): Promise<boolean> {
    return this.deliveries.delete(id);
  }

  // Blog Category methods
  async getAllBlogCategories(): Promise<BlogCategory[]> {
    return Array.from(this.blogCategories.values())
      .filter(category => category.isActive)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async getBlogCategory(id: string): Promise<BlogCategory | undefined> {
    return this.blogCategories.get(id);
  }

  async createBlogCategory(categoryData: InsertBlogCategory): Promise<BlogCategory> {
    const id = randomUUID();
    const category: BlogCategory = {
      ...categoryData,
      id,
      description: categoryData.description || null,
      isActive: categoryData.isActive ?? true,
      createdAt: new Date(),
    };
    this.blogCategories.set(id, category);
    return category;
  }

  async updateBlogCategory(id: string, updates: Partial<InsertBlogCategory>): Promise<BlogCategory | undefined> {
    const category = this.blogCategories.get(id);
    if (!category) return undefined;
    
    const updatedCategory: BlogCategory = {
      ...category,
      ...updates,
    };
    this.blogCategories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteBlogCategory(id: string): Promise<boolean> {
    // Check if there are any posts using this category
    const postsWithCategory = Array.from(this.blogPosts.values()).filter(post => post.categoryId === id);
    if (postsWithCategory.length > 0) {
      // Don't delete if posts are using this category
      return false;
    }
    return this.blogCategories.delete(id);
  }

  // Blog Post methods
  async getAllBlogPosts(filters?: { categoryId?: string; isPublished?: boolean }): Promise<BlogPost[]> {
    let posts = Array.from(this.blogPosts.values());
    
    if (filters?.categoryId) {
      posts = posts.filter(post => post.categoryId === filters.categoryId);
    }
    
    if (filters?.isPublished !== undefined) {
      posts = posts.filter(post => post.isPublished === filters.isPublished);
    }
    
    return posts.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getBlogPost(id: string): Promise<BlogPost | undefined> {
    return this.blogPosts.get(id);
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    return Array.from(this.blogPosts.values()).find(post => post.slug === slug);
  }

  async createBlogPost(postData: InsertBlogPost): Promise<BlogPost> {
    const id = randomUUID();
    const post: BlogPost = {
      ...postData,
      id,
      content: postData.content || null,
      excerpt: postData.excerpt || null,
      imagePath: postData.imagePath || null,
      readTime: postData.readTime || null,
      isPublished: postData.isPublished ?? false,
      publishedAt: null,
      blocks: postData.blocks || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.blogPosts.set(id, post);
    return post;
  }

  async updateBlogPost(id: string, updates: Partial<InsertBlogPost>): Promise<BlogPost | undefined> {
    const post = this.blogPosts.get(id);
    if (!post) return undefined;
    
    const updatedPost: BlogPost = {
      ...post,
      ...updates,
      updatedAt: new Date(),
    };
    this.blogPosts.set(id, updatedPost);
    return updatedPost;
  }

  async deleteBlogPost(id: string): Promise<boolean> {
    return this.blogPosts.delete(id);
  }

  async publishBlogPost(id: string): Promise<BlogPost | undefined> {
    const post = this.blogPosts.get(id);
    if (!post) return undefined;
    
    const publishedPost: BlogPost = {
      ...post,
      isPublished: true,
      publishedAt: new Date(),
      updatedAt: new Date(),
    };
    this.blogPosts.set(id, publishedPost);
    return publishedPost;
  }

  async incrementBlogPostViews(id: string): Promise<void> {
    const post = this.blogPosts.get(id);
    if (!post) return;
    
    const updatedPost: BlogPost = {
      ...post,
      views: (post.views || 0) + 1,
    };
    this.blogPosts.set(id, updatedPost);
  }

  // GDPR Audit Logging Methods
  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const auditLog: AuditLog = {
      id: randomUUID(),
      ...log,
      resourceId: log.resourceId || null,
      details: log.details || null,
      ipAddress: log.ipAddress || null,
      userAgent: log.userAgent || null,
      createdAt: new Date(),
    };
    this.auditLogs.set(auditLog.id, auditLog);
    return auditLog;
  }

  async getAuditLogs(filters?: { userId?: string; resourceType?: string; action?: string; startDate?: Date; endDate?: Date }): Promise<AuditLog[]> {
    const logs = Array.from(this.auditLogs.values());
    
    if (!filters) {
      return logs.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
    }

    const filtered = logs.filter(log => {
      if (filters.userId && log.userId !== filters.userId) return false;
      if (filters.resourceType && log.resourceType !== filters.resourceType) return false;
      if (filters.action && log.action !== filters.action) return false;
      if (filters.startDate && log.createdAt && log.createdAt < filters.startDate) return false;
      if (filters.endDate && log.createdAt && log.createdAt > filters.endDate) return false;
      return true;
    });

    return filtered.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getAuditLogsByResourceId(resourceId: string): Promise<AuditLog[]> {
    const logs = Array.from(this.auditLogs.values())
      .filter(log => log.resourceId === resourceId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
    
    return logs;
  }

  // CQC Audit Management Methods
  async getAllCqcAudits(filters?: { auditType?: string; status?: string; auditorId?: string; branch?: string }): Promise<CqcAudit[]> {
    let audits = Array.from(this.cqcAudits.values());
    
    if (filters?.auditType) {
      audits = audits.filter(audit => audit.auditType === filters.auditType);
    }
    if (filters?.status) {
      audits = audits.filter(audit => audit.status === filters.status);
    }
    if (filters?.auditorId) {
      audits = audits.filter(audit => audit.auditorId === filters.auditorId);
    }
    if (filters?.branch) {
      audits = audits.filter(audit => audit.branch === filters.branch);
    }
    
    return audits.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getCqcAudit(id: string): Promise<CqcAudit | undefined> {
    return this.cqcAudits.get(id);
  }

  async createCqcAudit(auditData: InsertCqcAudit): Promise<CqcAudit> {
    const id = randomUUID();
    const audit: CqcAudit = {
      ...auditData,
      id,
      status: auditData.status || "draft",
      score: auditData.score || null,
      totalItems: auditData.totalItems || null,
      compliantItems: auditData.compliantItems || null,
      actionItemsCount: auditData.actionItemsCount || null,
      findings: auditData.findings || null,
      recommendations: auditData.recommendations || null,
      nextAuditDue: auditData.nextAuditDue || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.cqcAudits.set(id, audit);
    return audit;
  }

  async updateCqcAudit(id: string, updates: Partial<InsertCqcAudit>): Promise<CqcAudit | undefined> {
    const audit = this.cqcAudits.get(id);
    if (!audit) return undefined;
    
    const updatedAudit: CqcAudit = {
      ...audit,
      ...updates,
      updatedAt: new Date(),
    };
    this.cqcAudits.set(id, updatedAudit);
    return updatedAudit;
  }

  async deleteCqcAudit(id: string): Promise<boolean> {
    return this.cqcAudits.delete(id);
  }

  // CQC Audit Categories Methods
  async getAllCqcAuditCategories(auditType?: string): Promise<CqcAuditCategory[]> {
    let categories = Array.from(this.cqcAuditCategories.values()).filter(cat => cat.isActive);
    
    if (auditType) {
      categories = categories.filter(category => category.auditType === auditType);
    }
    
    return categories.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }

  async getCqcAuditCategory(id: string): Promise<CqcAuditCategory | undefined> {
    return this.cqcAuditCategories.get(id);
  }

  async createCqcAuditCategory(categoryData: InsertCqcAuditCategory): Promise<CqcAuditCategory> {
    const id = randomUUID();
    const category: CqcAuditCategory = {
      ...categoryData,
      id,
      isActive: categoryData.isActive ?? true,
      sortOrder: categoryData.sortOrder || 0,
      createdAt: new Date(),
    };
    this.cqcAuditCategories.set(id, category);
    return category;
  }

  async updateCqcAuditCategory(id: string, updates: Partial<InsertCqcAuditCategory>): Promise<CqcAuditCategory | undefined> {
    const category = this.cqcAuditCategories.get(id);
    if (!category) return undefined;
    
    const updatedCategory: CqcAuditCategory = {
      ...category,
      ...updates,
    };
    this.cqcAuditCategories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteCqcAuditCategory(id: string): Promise<boolean> {
    return this.cqcAuditCategories.delete(id);
  }

  // CQC Checklist Items Methods
  async getCqcChecklistItems(categoryId?: string): Promise<CqcChecklistItem[]> {
    let items = Array.from(this.cqcChecklistItems.values()).filter(item => item.isActive);
    
    if (categoryId) {
      items = items.filter(item => item.categoryId === categoryId);
    }
    
    return items.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }

  async getCqcChecklistItem(id: string): Promise<CqcChecklistItem | undefined> {
    return this.cqcChecklistItems.get(id);
  }

  async createCqcChecklistItem(itemData: InsertCqcChecklistItem): Promise<CqcChecklistItem> {
    const id = randomUUID();
    const item: CqcChecklistItem = {
      ...itemData,
      id,
      guidance: itemData.guidance || null,
      regulationReference: itemData.regulationReference || null,
      isRequired: itemData.isRequired ?? true,
      section: itemData.section || null,
      sortOrder: itemData.sortOrder || 0,
      isActive: itemData.isActive ?? true,
      createdAt: new Date(),
    };
    this.cqcChecklistItems.set(id, item);
    return item;
  }

  async updateCqcChecklistItem(id: string, updates: Partial<InsertCqcChecklistItem>): Promise<CqcChecklistItem | undefined> {
    const item = this.cqcChecklistItems.get(id);
    if (!item) return undefined;
    
    const updatedItem: CqcChecklistItem = {
      ...item,
      ...updates,
    };
    this.cqcChecklistItems.set(id, updatedItem);
    return updatedItem;
  }

  async deleteCqcChecklistItem(id: string): Promise<boolean> {
    return this.cqcChecklistItems.delete(id);
  }

  // CQC Audit Responses Methods
  async getCqcAuditResponses(auditId: string): Promise<CqcAuditResponse[]> {
    return Array.from(this.cqcAuditResponses.values())
      .filter(response => response.auditId === auditId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getCqcAuditResponse(id: string): Promise<CqcAuditResponse | undefined> {
    return this.cqcAuditResponses.get(id);
  }

  async createCqcAuditResponse(responseData: InsertCqcAuditResponse): Promise<CqcAuditResponse> {
    const id = randomUUID();
    const response: CqcAuditResponse = {
      ...responseData,
      id,
      evidence: responseData.evidence || null,
      actionRequired: responseData.actionRequired || null,
      actionDueDate: responseData.actionDueDate || null,
      actionOwner: responseData.actionOwner || null,
      actionStatus: responseData.actionStatus || 'pending',
      actionCompletedDate: responseData.actionCompletedDate || null,
      notes: responseData.notes || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.cqcAuditResponses.set(id, response);
    return response;
  }

  async updateCqcAuditResponse(id: string, updates: Partial<InsertCqcAuditResponse>): Promise<CqcAuditResponse | undefined> {
    const response = this.cqcAuditResponses.get(id);
    if (!response) return undefined;
    
    const updatedResponse: CqcAuditResponse = {
      ...response,
      ...updates,
      updatedAt: new Date(),
    };
    this.cqcAuditResponses.set(id, updatedResponse);
    return updatedResponse;
  }

  async deleteCqcAuditResponse(id: string): Promise<boolean> {
    return this.cqcAuditResponses.delete(id);
  }

  // CQC Compliance Records Methods
  async getAllCqcComplianceRecords(filters?: { staffId?: string; recordType?: string; status?: string; branch?: string }): Promise<CqcComplianceRecord[]> {
    let records = Array.from(this.cqcComplianceRecords.values());
    
    if (filters?.staffId) {
      records = records.filter(record => record.staffId === filters.staffId);
    }
    if (filters?.recordType) {
      records = records.filter(record => record.recordType === filters.recordType);
    }
    if (filters?.status) {
      records = records.filter(record => record.status === filters.status);
    }
    if (filters?.branch) {
      records = records.filter(record => record.branch === filters.branch);
    }
    
    return records.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getCqcComplianceRecord(id: string): Promise<CqcComplianceRecord | undefined> {
    return this.cqcComplianceRecords.get(id);
  }

  async createCqcComplianceRecord(recordData: InsertCqcComplianceRecord): Promise<CqcComplianceRecord> {
    const id = randomUUID();
    const record: CqcComplianceRecord = {
      ...recordData,
      id,
      staffId: recordData.staffId || null,
      staffName: recordData.staffName || null,
      issueDate: recordData.issueDate || null,
      expiryDate: recordData.expiryDate || null,
      renewalDue: recordData.renewalDue || null,
      status: recordData.status || 'active',
      certificateNumber: recordData.certificateNumber || null,
      issuingBody: recordData.issuingBody || null,
      documentPath: recordData.documentPath || null,
      notes: recordData.notes || null,
      reminderSent: recordData.reminderSent || false,
      lastReminderDate: recordData.lastReminderDate || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.cqcComplianceRecords.set(id, record);
    return record;
  }

  async updateCqcComplianceRecord(id: string, updates: Partial<InsertCqcComplianceRecord>): Promise<CqcComplianceRecord | undefined> {
    const record = this.cqcComplianceRecords.get(id);
    if (!record) return undefined;
    
    const updatedRecord: CqcComplianceRecord = {
      ...record,
      ...updates,
      updatedAt: new Date(),
    };
    this.cqcComplianceRecords.set(id, updatedRecord);
    return updatedRecord;
  }

  async deleteCqcComplianceRecord(id: string): Promise<boolean> {
    return this.cqcComplianceRecords.delete(id);
  }

  // Route Planning - Clients
  async getAllClients(filters?: { isActive?: boolean; postcode?: string }): Promise<Client[]> {
    let clients = Array.from(this.clients.values());
    if (filters?.isActive !== undefined) {
      clients = clients.filter(c => c.isActive === filters.isActive);
    }
    if (filters?.postcode) {
      clients = clients.filter(c => c.postcode?.toLowerCase().includes(filters.postcode!.toLowerCase()));
    }
    return clients;
  }

  async getClient(id: string): Promise<Client | undefined> {
    return this.clients.get(id);
  }

  async getClientByPostcode(postcode: string): Promise<Client[]> {
    return Array.from(this.clients.values()).filter(c => 
      c.postcode?.toLowerCase().includes(postcode.toLowerCase())
    );
  }

  async createClient(client: InsertClient): Promise<Client> {
    const id = randomUUID();
    const now = new Date();
    const newClient: Client = {
      id,
      createdAt: now,
      updatedAt: now,
      ...client,
    };
    this.clients.set(id, newClient);
    return newClient;
  }

  async updateClient(id: string, updates: Partial<InsertClient>): Promise<Client | undefined> {
    const client = this.clients.get(id);
    if (!client) return undefined;
    
    const updatedClient: Client = {
      ...client,
      ...updates,
      updatedAt: new Date(),
    };
    this.clients.set(id, updatedClient);
    return updatedClient;
  }

  async deleteClient(id: string): Promise<boolean> {
    return this.clients.delete(id);
  }

  // Route Planning - Visits
  async getAllVisits(filters?: { date?: string; clientId?: string; timeSlot?: string; status?: string }): Promise<Visit[]> {
    let visits = Array.from(this.visits.values());
    if (filters?.date) {
      visits = visits.filter(v => v.visitDate === filters.date);
    }
    if (filters?.clientId) {
      visits = visits.filter(v => v.clientId === filters.clientId);
    }
    if (filters?.timeSlot) {
      visits = visits.filter(v => v.timeSlot === filters.timeSlot);
    }
    if (filters?.status) {
      visits = visits.filter(v => v.status === filters.status);
    }
    return visits;
  }

  async getVisitsByDate(date: string): Promise<Visit[]> {
    return Array.from(this.visits.values()).filter(v => v.visitDate === date);
  }

  async getVisitsByClientId(clientId: string): Promise<Visit[]> {
    return Array.from(this.visits.values()).filter(v => v.clientId === clientId);
  }

  async getVisit(id: string): Promise<Visit | undefined> {
    return this.visits.get(id);
  }

  async createVisit(visit: InsertVisit): Promise<Visit> {
    const id = randomUUID();
    const now = new Date();
    const newVisit: Visit = {
      id,
      createdAt: now,
      updatedAt: now,
      ...visit,
    };
    this.visits.set(id, newVisit);
    return newVisit;
  }

  async updateVisit(id: string, updates: Partial<InsertVisit>): Promise<Visit | undefined> {
    const visit = this.visits.get(id);
    if (!visit) return undefined;
    
    const updatedVisit: Visit = {
      ...visit,
      ...updates,
      updatedAt: new Date(),
    };
    this.visits.set(id, updatedVisit);
    return updatedVisit;
  }

  async deleteVisit(id: string): Promise<boolean> {
    return this.visits.delete(id);
  }

  // Route Planning - Runs
  async getAllRuns(filters?: { date?: string; travelMode?: string; status?: string; createdBy?: string }): Promise<Run[]> {
    let runs = Array.from(this.runs.values());
    if (filters?.date) {
      runs = runs.filter(r => r.runDate === filters.date);
    }
    if (filters?.travelMode) {
      runs = runs.filter(r => r.travelMode === filters.travelMode);
    }
    if (filters?.status) {
      runs = runs.filter(r => r.status === filters.status);
    }
    if (filters?.createdBy) {
      runs = runs.filter(r => r.createdBy === filters.createdBy);
    }
    return runs;
  }

  async getRunsByDate(date: string): Promise<Run[]> {
    return Array.from(this.runs.values()).filter(r => r.runDate === date);
  }

  async getRun(id: string): Promise<Run | undefined> {
    return this.runs.get(id);
  }

  async createRun(run: InsertRun): Promise<Run> {
    const id = randomUUID();
    const now = new Date();
    const newRun: Run = {
      id,
      createdAt: now,
      updatedAt: now,
      ...run,
    };
    this.runs.set(id, newRun);
    return newRun;
  }

  async updateRun(id: string, updates: Partial<InsertRun>): Promise<Run | undefined> {
    const run = this.runs.get(id);
    if (!run) return undefined;
    
    const updatedRun: Run = {
      ...run,
      ...updates,
      updatedAt: new Date(),
    };
    this.runs.set(id, updatedRun);
    return updatedRun;
  }

  async deleteRun(id: string): Promise<boolean> {
    return this.runs.delete(id);
  }

  // Route Planning - Run Stops
  async getRunStops(runId: string): Promise<RunStop[]> {
    return Array.from(this.runStops.values()).filter(rs => rs.runId === runId);
  }

  async getRunStop(id: string): Promise<RunStop | undefined> {
    return this.runStops.get(id);
  }

  async createRunStop(runStop: InsertRunStop): Promise<RunStop> {
    const id = randomUUID();
    const now = new Date();
    const newRunStop: RunStop = {
      id,
      createdAt: now,
      ...runStop,
    };
    this.runStops.set(id, newRunStop);
    return newRunStop;
  }

  async updateRunStop(id: string, updates: Partial<InsertRunStop>): Promise<RunStop | undefined> {
    const runStop = this.runStops.get(id);
    if (!runStop) return undefined;
    
    const updatedRunStop: RunStop = {
      ...runStop,
      ...updates,
    };
    this.runStops.set(id, updatedRunStop);
    return updatedRunStop;
  }

  async deleteRunStop(id: string): Promise<boolean> {
    return this.runStops.delete(id);
  }

  async deleteRunStops(runId: string): Promise<boolean> {
    const runStops = Array.from(this.runStops.entries()).filter(([_, rs]) => rs.runId === runId);
    runStops.forEach(([id]) => this.runStops.delete(id));
    return true;
  }

  // Route Planning - Geocoding Cache
  async getGeocode(address: string): Promise<Geocode | undefined> {
    return Array.from(this.geocodes.values()).find(g => g.cacheKey === address);
  }

  async createGeocode(geocode: InsertGeocode): Promise<Geocode> {
    const id = randomUUID();
    const now = new Date();
    const newGeocode: Geocode = {
      id,
      createdAt: now,
      updatedAt: now,
      ...geocode,
    };
    this.geocodes.set(id, newGeocode);
    return newGeocode;
  }

  async updateGeocode(id: string, updates: Partial<InsertGeocode>): Promise<Geocode | undefined> {
    const geocode = this.geocodes.get(id);
    if (!geocode) return undefined;
    
    const updatedGeocode: Geocode = {
      ...geocode,
      ...updates,
      updatedAt: new Date(),
    };
    this.geocodes.set(id, updatedGeocode);
    return updatedGeocode;
  }

  // Reference Requests
  async getAllReferenceRequests(filters?: { status?: string }): Promise<ReferenceRequest[]> {
    let requests = Array.from(this.referenceRequests.values());
    if (filters?.status) {
      requests = requests.filter(r => r.status === filters.status);
    }
    return requests.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }

  async getReferenceRequest(id: string): Promise<ReferenceRequest | undefined> {
    return this.referenceRequests.get(id);
  }

  async getReferenceRequestByToken(token: string): Promise<ReferenceRequest | undefined> {
    return Array.from(this.referenceRequests.values()).find(r => r.token === token);
  }

  async createReferenceRequest(request: InsertReferenceRequest): Promise<ReferenceRequest> {
    const id = randomUUID();
    const newRequest: ReferenceRequest = {
      id,
      createdAt: new Date(),
      requestedAt: null,
      receivedAt: null,
      ...request,
    };
    this.referenceRequests.set(id, newRequest);
    return newRequest;
  }

  async updateReferenceRequest(id: string, updates: Partial<InsertReferenceRequest>): Promise<ReferenceRequest | undefined> {
    const request = this.referenceRequests.get(id);
    if (!request) return undefined;
    
    const updatedRequest: ReferenceRequest = {
      ...request,
      ...updates,
    };
    this.referenceRequests.set(id, updatedRequest);
    return updatedRequest;
  }

  async updateReferenceRequestStatus(id: string, status: string): Promise<ReferenceRequest | undefined> {
    const request = this.referenceRequests.get(id);
    if (!request) return undefined;
    
    const updatedRequest: ReferenceRequest = {
      ...request,
      status,
      requestedAt: status === 'requested' ? new Date() : request.requestedAt,
      receivedAt: status === 'received' ? new Date() : request.receivedAt,
    };
    this.referenceRequests.set(id, updatedRequest);
    return updatedRequest;
  }

  async deleteReferenceRequest(id: string): Promise<boolean> {
    return this.referenceRequests.delete(id);
  }

  // Service Improvement Plan (SIP) - MemStorage implementations
  async getAllServiceImprovementPlanItems(filters?: { status?: string; priority?: string; cqcDomain?: string; branch?: string }): Promise<ServiceImprovementPlanItem[]> {
    let items = Array.from(this.sipItems.values());
    if (filters?.status) items = items.filter(i => i.status === filters.status);
    if (filters?.priority) items = items.filter(i => i.priority === filters.priority);
    if (filters?.cqcDomain) items = items.filter(i => i.cqcDomain === filters.cqcDomain);
    if (filters?.branch) items = items.filter(i => i.branch === filters.branch);
    return items.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getServiceImprovementPlanItem(id: string): Promise<ServiceImprovementPlanItem | undefined> {
    return this.sipItems.get(id);
  }

  async createServiceImprovementPlanItem(item: InsertServiceImprovementPlanItem): Promise<ServiceImprovementPlanItem> {
    const id = randomUUID();
    const refNumber = await this.getNextSipReferenceNumber();
    const newItem: ServiceImprovementPlanItem = {
      id,
      referenceNumber: refNumber,
      createdAt: new Date(),
      updatedAt: new Date(),
      identifiedDate: new Date(),
      progressPercentage: 0,
      status: 'open',
      ...item,
    };
    this.sipItems.set(id, newItem);
    return newItem;
  }

  async updateServiceImprovementPlanItem(id: string, updates: UpdateServiceImprovementPlanItem): Promise<ServiceImprovementPlanItem | undefined> {
    const item = this.sipItems.get(id);
    if (!item) return undefined;
    const updatedItem: ServiceImprovementPlanItem = {
      ...item,
      ...updates,
      updatedAt: new Date(),
    };
    this.sipItems.set(id, updatedItem);
    return updatedItem;
  }

  async completeServiceImprovementPlanItem(id: string, completedBy: string): Promise<ServiceImprovementPlanItem | undefined> {
    const item = this.sipItems.get(id);
    if (!item) return undefined;
    const now = new Date();
    const updateEntry = {
      date: now.toISOString(),
      update: 'Marked as completed',
      updatedBy: completedBy
    };
    const updatedItem: ServiceImprovementPlanItem = {
      ...item,
      status: 'completed',
      completedDate: now,
      progressPercentage: 100,
      updatedAt: now,
      updateHistory: [...(item.updateHistory || []), updateEntry],
    };
    this.sipItems.set(id, updatedItem);
    return updatedItem;
  }

  async deleteServiceImprovementPlanItem(id: string): Promise<boolean> {
    return this.sipItems.delete(id);
  }

  async getNextSipReferenceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const items = Array.from(this.sipItems.values());
    const yearItems = items.filter(i => i.referenceNumber.includes(`SIP-${year}`));
    const nextNum = yearItems.length + 1;
    return `SIP-${year}-${String(nextNum).padStart(3, '0')}`;
  }

  // CQC Quality Statements (stub implementations for MemStorage)
  async getAllCqcQualityStatements(keyQuestion?: string): Promise<CqcQualityStatement[]> {
    return [];
  }

  async getCqcQualityStatement(id: string): Promise<CqcQualityStatement | undefined> {
    return undefined;
  }

  async createCqcQualityStatement(statement: InsertCqcQualityStatement): Promise<CqcQualityStatement> {
    const id = randomUUID();
    const now = new Date();
    return { id, createdAt: now, ...statement } as CqcQualityStatement;
  }

  async updateCqcQualityStatement(id: string, updates: Partial<InsertCqcQualityStatement>): Promise<CqcQualityStatement | undefined> {
    return undefined;
  }

  async deleteCqcQualityStatement(id: string): Promise<boolean> {
    return false;
  }

  // CQC Evidence Categories (stub implementations for MemStorage)
  async getAllCqcEvidenceCategories(): Promise<CqcEvidenceCategory[]> {
    return [];
  }

  async getCqcEvidenceCategory(id: string): Promise<CqcEvidenceCategory | undefined> {
    return undefined;
  }

  async createCqcEvidenceCategory(category: InsertCqcEvidenceCategory): Promise<CqcEvidenceCategory> {
    const id = randomUUID();
    return { id, ...category } as CqcEvidenceCategory;
  }

  async updateCqcEvidenceCategory(id: string, updates: Partial<InsertCqcEvidenceCategory>): Promise<CqcEvidenceCategory | undefined> {
    return undefined;
  }

  async deleteCqcEvidenceCategory(id: string): Promise<boolean> {
    return false;
  }

  // CQC Audit Evidence (stub implementations for MemStorage)
  async getAllCqcAuditEvidence(filters?: { auditId?: string; evidenceCategoryId?: string; qualityStatementId?: string }): Promise<CqcAuditEvidence[]> {
    return [];
  }

  async getCqcAuditEvidence(id: string): Promise<CqcAuditEvidence | undefined> {
    return undefined;
  }

  async createCqcAuditEvidence(evidence: InsertCqcAuditEvidence): Promise<CqcAuditEvidence> {
    const id = randomUUID();
    const now = new Date();
    return { id, createdAt: now, ...evidence } as CqcAuditEvidence;
  }

  async updateCqcAuditEvidence(id: string, updates: Partial<InsertCqcAuditEvidence>): Promise<CqcAuditEvidence | undefined> {
    return undefined;
  }

  async deleteCqcAuditEvidence(id: string): Promise<boolean> {
    return false;
  }

  // CQC Quality Assessments (stub implementations for MemStorage)
  async getAllCqcQualityAssessments(filters?: { auditId?: string; qualityStatementId?: string; assessmentRating?: string }): Promise<CqcQualityAssessment[]> {
    return [];
  }

  async getCqcQualityAssessment(id: string): Promise<CqcQualityAssessment | undefined> {
    return undefined;
  }

  async createCqcQualityAssessment(assessment: InsertCqcQualityAssessment): Promise<CqcQualityAssessment> {
    const id = randomUUID();
    const now = new Date();
    return { id, createdAt: now, updatedAt: now, ...assessment } as CqcQualityAssessment;
  }

  async updateCqcQualityAssessment(id: string, updates: Partial<InsertCqcQualityAssessment>): Promise<CqcQualityAssessment | undefined> {
    return undefined;
  }

  async deleteCqcQualityAssessment(id: string): Promise<boolean> {
    return false;
  }

  // CQC Feedback Campaigns (MemStorage stubs)
  private feedbackCampaigns: Map<string, CqcFeedbackCampaign> = new Map();
  private feedbackResponses: Map<string, CqcFeedbackResponse> = new Map();

  async getAllCqcFeedbackCampaigns(filters?: { category?: string; status?: string; branch?: string }): Promise<CqcFeedbackCampaign[]> {
    let campaigns = Array.from(this.feedbackCampaigns.values());
    if (filters?.category) campaigns = campaigns.filter(c => c.category === filters.category);
    if (filters?.status) campaigns = campaigns.filter(c => c.status === filters.status);
    if (filters?.branch) campaigns = campaigns.filter(c => c.branch === filters.branch);
    return campaigns.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getCqcFeedbackCampaign(id: string): Promise<CqcFeedbackCampaign | undefined> {
    return this.feedbackCampaigns.get(id);
  }

  async getCqcFeedbackCampaignByToken(token: string): Promise<CqcFeedbackCampaign | undefined> {
    return Array.from(this.feedbackCampaigns.values()).find(c => c.linkToken === token);
  }

  async createCqcFeedbackCampaign(campaign: InsertCqcFeedbackCampaign): Promise<CqcFeedbackCampaign> {
    const id = randomUUID();
    const now = new Date();
    const newCampaign: CqcFeedbackCampaign = {
      id,
      responseCount: 0,
      createdAt: now,
      updatedAt: now,
      ...campaign,
    };
    this.feedbackCampaigns.set(id, newCampaign);
    return newCampaign;
  }

  async updateCqcFeedbackCampaign(id: string, updates: UpdateCqcFeedbackCampaign): Promise<CqcFeedbackCampaign | undefined> {
    const campaign = this.feedbackCampaigns.get(id);
    if (!campaign) return undefined;
    const updated = { ...campaign, ...updates, updatedAt: new Date() };
    this.feedbackCampaigns.set(id, updated);
    return updated;
  }

  async deleteCqcFeedbackCampaign(id: string): Promise<boolean> {
    return this.feedbackCampaigns.delete(id);
  }

  async getAllCqcFeedbackResponses(filters?: { campaignId?: string; branch?: string; source?: string; status?: string }): Promise<CqcFeedbackResponse[]> {
    let responses = Array.from(this.feedbackResponses.values());
    if (filters?.campaignId) responses = responses.filter(r => r.campaignId === filters.campaignId);
    if (filters?.branch) responses = responses.filter(r => r.branch === filters.branch);
    if (filters?.source) responses = responses.filter(r => r.source === filters.source);
    if (filters?.status) responses = responses.filter(r => r.status === filters.status);
    return responses.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getCqcFeedbackResponse(id: string): Promise<CqcFeedbackResponse | undefined> {
    return this.feedbackResponses.get(id);
  }

  async createCqcFeedbackResponse(response: InsertCqcFeedbackResponse): Promise<CqcFeedbackResponse> {
    const id = randomUUID();
    const now = new Date();
    const newResponse: CqcFeedbackResponse = {
      id,
      createdAt: now,
      ...response,
    };
    this.feedbackResponses.set(id, newResponse);
    // Increment campaign response count
    const campaign = this.feedbackCampaigns.get(response.campaignId);
    if (campaign) {
      campaign.responseCount = (campaign.responseCount || 0) + 1;
      this.feedbackCampaigns.set(response.campaignId, campaign);
    }
    return newResponse;
  }

  async updateCqcFeedbackResponse(id: string, updates: Partial<InsertCqcFeedbackResponse>): Promise<CqcFeedbackResponse | undefined> {
    const response = this.feedbackResponses.get(id);
    if (!response) return undefined;
    const updated = { ...response, ...updates };
    this.feedbackResponses.set(id, updated);
    return updated;
  }

  async deleteCqcFeedbackResponse(id: string): Promise<boolean> {
    return this.feedbackResponses.delete(id);
  }

  async getCqcFeedbackCampaignStats(campaignId: string): Promise<{
    totalResponses: number;
    averageRating: number;
    npsScore: number;
    ratingDistribution: Record<number, number>;
    recommendPercentage: number;
  }> {
    const responses = Array.from(this.feedbackResponses.values()).filter(r => r.campaignId === campaignId);
    const ratingsWithValue = responses.filter(r => r.overallRating !== null && r.overallRating !== undefined);
    const npsResponses = responses.filter(r => r.npsScore !== null && r.npsScore !== undefined);
    const recommendResponses = responses.filter(r => r.wouldRecommend !== null && r.wouldRecommend !== undefined);
    
    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalRating = 0;
    ratingsWithValue.forEach(r => {
      const rating = r.overallRating!;
      ratingDistribution[rating] = (ratingDistribution[rating] || 0) + 1;
      totalRating += rating;
    });
    
    // Calculate NPS: (Promoters - Detractors) / Total * 100
    const promoters = npsResponses.filter(r => r.npsScore! >= 9).length;
    const detractors = npsResponses.filter(r => r.npsScore! <= 6).length;
    const npsScore = npsResponses.length > 0 ? ((promoters - detractors) / npsResponses.length) * 100 : 0;
    
    const recommendYes = recommendResponses.filter(r => r.wouldRecommend === true).length;
    const recommendPercentage = recommendResponses.length > 0 ? (recommendYes / recommendResponses.length) * 100 : 0;
    
    return {
      totalResponses: responses.length,
      averageRating: ratingsWithValue.length > 0 ? totalRating / ratingsWithValue.length : 0,
      npsScore: Math.round(npsScore),
      ratingDistribution,
      recommendPercentage: Math.round(recommendPercentage),
    };
  }

  // Audit Schedule Settings (MemStorage stubs)
  private auditScheduleSettingsMap: Map<string, AuditScheduleSettings> = new Map();

  async getAllAuditScheduleSettings(filters?: { branch?: string }): Promise<AuditScheduleSettings[]> {
    let settings = Array.from(this.auditScheduleSettingsMap.values());
    if (filters?.branch) settings = settings.filter(s => s.branch === filters.branch);
    return settings;
  }

  async getAuditScheduleSettings(id: string): Promise<AuditScheduleSettings | undefined> {
    return this.auditScheduleSettingsMap.get(id);
  }

  async getAuditScheduleSettingsByCategory(category: string, branch: string): Promise<AuditScheduleSettings | undefined> {
    return Array.from(this.auditScheduleSettingsMap.values()).find(s => s.category === category && s.branch === branch);
  }

  async createAuditScheduleSettings(settings: InsertAuditScheduleSettings): Promise<AuditScheduleSettings> {
    const id = randomUUID();
    const now = new Date();
    const newSettings: AuditScheduleSettings = {
      id,
      isActive: true,
      reminderDays: 14,
      createdAt: now,
      updatedAt: now,
      ...settings,
    };
    this.auditScheduleSettingsMap.set(id, newSettings);
    return newSettings;
  }

  async updateAuditScheduleSettings(id: string, updates: Partial<InsertAuditScheduleSettings>): Promise<AuditScheduleSettings | undefined> {
    const existing = this.auditScheduleSettingsMap.get(id);
    if (!existing) return undefined;
    const updated: AuditScheduleSettings = { ...existing, ...updates, updatedAt: new Date() };
    this.auditScheduleSettingsMap.set(id, updated);
    return updated;
  }

  async upsertAuditScheduleSettings(settings: InsertAuditScheduleSettings): Promise<AuditScheduleSettings> {
    const existing = await this.getAuditScheduleSettingsByCategory(settings.category, settings.branch);
    if (existing) {
      return (await this.updateAuditScheduleSettings(existing.id, settings))!;
    }
    return this.createAuditScheduleSettings(settings);
  }

  async deleteAuditScheduleSettings(id: string): Promise<boolean> {
    return this.auditScheduleSettingsMap.delete(id);
  }

}

// Database storage implementation using Drizzle ORM
export class DrizzleStorage implements IStorage {
  // User management methods
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserById(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async getUserByPasswordToken(token: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.passwordToken, token)).limit(1);
    return result[0];
  }

  async setUserPassword(id: string, hashedPassword: string): Promise<void> {
    await db.update(users)
      .set({ 
        password: hashedPassword, 
        passwordToken: null,
        tokenExpiresAt: null 
      })
      .where(eq(users.id, id));
  }

  async getAllUsers(): Promise<User[]> {
    const result = await db.select().from(users).orderBy(desc(users.createdAt));
    return result;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Hash password if provided, otherwise leave as null
    const hashedPassword = insertUser.password ? await bcrypt.hash(insertUser.password, 10) : null;
    
    const result = await db.insert(users).values({
      username: insertUser.username,
      password: hashedPassword,
      passwordToken: insertUser.passwordToken || null,
      tokenExpiresAt: insertUser.tokenExpiresAt || null,
      role: insertUser.role || "admin",
      isActive: insertUser.isActive ?? true,
    }).returning();
    
    return result[0];
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    // Hash password if it's being updated
    const updateData = { ...updates };
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const result = await db.update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    
    return result[0];
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    return result.length > 0;
  }

  // Job management methods
  async getAllJobs(filters?: { location?: string; type?: string; salaryRange?: string }): Promise<Job[]> {
    let query = db.select().from(jobs).where(eq(jobs.isActive, true));
    
    // Note: Complex filtering with dynamic WHERE clauses would require a more sophisticated approach
    // For now, we'll get all active jobs and filter in memory (can be optimized later)
    const result = await query.orderBy(desc(jobs.createdAt));
    let filteredJobs = result;
    
    if (filters?.location) {
      filteredJobs = filteredJobs.filter(job => 
        job.location.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }
    
    if (filters?.type) {
      filteredJobs = filteredJobs.filter(job => job.type === filters.type);
    }
    
    if (filters?.salaryRange) {
      const [min, max] = filters.salaryRange.split('-').map(Number);
      filteredJobs = filteredJobs.filter(job => {
        const jobSalary = job.salaryMin;
        return jobSalary >= (min * 100) && (!max || jobSalary <= (max * 100));
      });
    }
    
    return filteredJobs;
  }

  // Admin version that returns ALL jobs regardless of status
  async getAllJobsForAdmin(filters?: { location?: string; type?: string; salaryRange?: string; status?: string }): Promise<Job[]> {
    let query = db.select().from(jobs);
    
    const result = await query.orderBy(desc(jobs.createdAt));
    let filteredJobs = result;
    
    if (filters?.location) {
      filteredJobs = filteredJobs.filter(job => 
        job.location.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }
    
    if (filters?.type) {
      filteredJobs = filteredJobs.filter(job => job.type === filters.type);
    }
    
    if (filters?.status) {
      if (filters.status === "active") {
        filteredJobs = filteredJobs.filter(job => job.isActive);
      } else if (filters.status === "inactive") {
        filteredJobs = filteredJobs.filter(job => !job.isActive);
      }
      // "all" shows both active and inactive
    }
    
    if (filters?.salaryRange) {
      const [min, max] = filters.salaryRange.split('-').map(Number);
      filteredJobs = filteredJobs.filter(job => {
        const jobSalary = job.salaryMin;
        return jobSalary >= (min * 100) && (!max || jobSalary <= (max * 100));
      });
    }
    
    return filteredJobs;
  }
  
  async getJob(id: string): Promise<Job | undefined> {
    const result = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
    return result[0];
  }
  
  async createJob(jobData: InsertJob): Promise<Job> {
    const result = await db.insert(jobs).values(jobData).returning();
    return result[0];
  }
  
  async updateJob(id: string, updates: Partial<InsertJob>): Promise<Job | undefined> {
    const result = await db.update(jobs)
      .set(updates)
      .where(eq(jobs.id, id))
      .returning();
    
    return result[0];
  }
  
  async deleteJob(id: string): Promise<boolean> {
    const result = await db.delete(jobs).where(eq(jobs.id, id)).returning();
    return result.length > 0;
  }
  // Application management methods
  async getAllApplications(): Promise<Application[]> { 
    return await db.select().from(applications).orderBy(desc(applications.createdAt));
  }
  
  async getApplicationsByJobId(jobId: string): Promise<Application[]> {
    return await db.select().from(applications)
      .where(eq(applications.jobId, jobId))
      .orderBy(desc(applications.createdAt));
  }
  
  async getApplication(id: string): Promise<Application | undefined> {
    const result = await db.select().from(applications).where(eq(applications.id, id)).limit(1);
    return result[0];
  }
  
  async createApplication(applicationData: InsertApplication): Promise<Application> {
    const result = await db.insert(applications).values([applicationData]).returning();
    return result[0];
  }
  
  async updateApplicationStatus(id: string, status: string): Promise<Application | undefined> {
    const result = await db.update(applications)
      .set({ status })
      .where(eq(applications.id, id))
      .returning();
    
    return result[0];
  }

  async updateApplicationNotes(id: string, notes: string): Promise<Application | undefined> {
    const result = await db.update(applications)
      .set({ notes })
      .where(eq(applications.id, id))
      .returning();
    
    return result[0];
  }

  // Recruitment Applications (Full Applications) - DatabaseStorage
  async getAllRecruitmentApplications(): Promise<RecruitmentApplication[]> {
    return await db.select().from(recruitmentApplications).orderBy(desc(recruitmentApplications.createdAt));
  }

  async getRecruitmentApplication(id: string): Promise<RecruitmentApplication | undefined> {
    const result = await db.select().from(recruitmentApplications)
      .where(eq(recruitmentApplications.id, id))
      .limit(1);
    return result[0];
  }

  async createRecruitmentApplication(application: InsertRecruitmentApplication): Promise<RecruitmentApplication> {
    const result = await db.insert(recruitmentApplications).values(application).returning();
    return result[0];
  }

  async updateRecruitmentApplicationStatus(id: string, status: string, reviewedBy?: string): Promise<RecruitmentApplication | undefined> {
    const updateData: any = { 
      status, 
      updatedAt: new Date()
    };
    
    if (reviewedBy) {
      updateData.reviewedBy = reviewedBy;
      updateData.reviewedAt = new Date();
    }

    const result = await db.update(recruitmentApplications)
      .set(updateData)
      .where(eq(recruitmentApplications.id, id))
      .returning();
    
    return result[0];
  }

  async updateRecruitmentApplicationNotes(id: string, adminNotes: string): Promise<RecruitmentApplication | undefined> {
    const result = await db.update(recruitmentApplications)
      .set({ 
        adminNotes,
        updatedAt: new Date()
      })
      .where(eq(recruitmentApplications.id, id))
      .returning();
    
    return result[0];
  }

  // Professional References - DatabaseStorage
  async getAllProfessionalReferences(): Promise<ProfessionalReference[]> {
    return await db.select().from(professionalReferences).orderBy(desc(professionalReferences.createdAt));
  }

  async getProfessionalReference(id: string): Promise<ProfessionalReference | undefined> {
    const result = await db.select().from(professionalReferences)
      .where(eq(professionalReferences.id, id))
      .limit(1);
    return result[0];
  }

  async createProfessionalReference(reference: InsertProfessionalReference): Promise<ProfessionalReference> {
    const result = await db.insert(professionalReferences).values(reference).returning();
    return result[0];
  }

  async updateProfessionalReferenceStatus(id: string, status: string, reviewedBy?: string): Promise<ProfessionalReference | undefined> {
    const updateData: any = { 
      status, 
      updatedAt: new Date()
    };
    
    if (reviewedBy) {
      updateData.reviewedBy = reviewedBy;
      updateData.reviewedAt = new Date();
    }

    const result = await db.update(professionalReferences)
      .set(updateData)
      .where(eq(professionalReferences.id, id))
      .returning();
    
    return result[0];
  }

  async updateProfessionalReferenceNotes(id: string, adminNotes: string): Promise<ProfessionalReference | undefined> {
    const result = await db.update(professionalReferences)
      .set({ 
        adminNotes,
        updatedAt: new Date()
      })
      .where(eq(professionalReferences.id, id))
      .returning();
    
    return result[0];
  }

  async getAllContactSubmissions(): Promise<ContactSubmission[]> {
    const result = await db.select().from(contactSubmissions).orderBy(desc(contactSubmissions.createdAt));
    return result;
  }
  async createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission> {
    const result = await db.insert(contactSubmissions).values(submission).returning();
    return result[0];
  }
  async updateContactSubmissionStatus(id: string, status: string): Promise<ContactSubmission | undefined> {
    const result = await db.update(contactSubmissions)
      .set({ status })
      .where(eq(contactSubmissions.id, id))
      .returning();
    
    return result[0];
  }
  async getAllFeedback(): Promise<Feedback[]> { return []; }
  async getFeedback(id: string): Promise<Feedback | undefined> { return undefined; }
  async createFeedback(feedback: InsertFeedback): Promise<Feedback> { throw new Error("Not implemented"); }
  async updateFeedback(id: string, updates: Partial<InsertFeedback>): Promise<Feedback | undefined> { return undefined; }
  async deleteFeedback(id: string): Promise<boolean> { return false; }
  async getAllNewsletters(): Promise<Newsletter[]> { return []; }
  async getNewsletter(id: string): Promise<Newsletter | undefined> { return undefined; }
  async getNewsletterBySlug(slug: string): Promise<Newsletter | undefined> { return undefined; }
  async createNewsletter(newsletter: InsertNewsletter): Promise<Newsletter> { throw new Error("Not implemented"); }
  async updateNewsletter(id: string, updates: Partial<InsertNewsletter>): Promise<Newsletter | undefined> { return undefined; }
  async deleteNewsletter(id: string): Promise<boolean> { return false; }
  async getNewsletterBlocks(newsletterId: string): Promise<NewsletterBlock[]> { return []; }
  async getNewsletterBlock(id: string): Promise<NewsletterBlock | undefined> { return undefined; }
  async createNewsletterBlock(block: InsertNewsletterBlock): Promise<NewsletterBlock> { throw new Error("Not implemented"); }
  async updateNewsletterBlock(id: string, updates: Partial<InsertNewsletterBlock>): Promise<NewsletterBlock | undefined> { return undefined; }
  async deleteNewsletterBlock(id: string): Promise<boolean> { return false; }
  async deleteNewsletterBlocks(newsletterId: string): Promise<boolean> { return false; }
  async getAllTemplates(): Promise<Template[]> { return []; }
  async getTemplate(id: string): Promise<Template | undefined> { return undefined; }
  async createTemplate(template: InsertTemplate): Promise<Template> { throw new Error("Not implemented"); }
  async updateTemplate(id: string, updates: Partial<InsertTemplate>): Promise<Template | undefined> { return undefined; }
  async deleteTemplate(id: string): Promise<boolean> { return false; }
  async getAllSubscribers(filters?: { status?: string; source?: string }): Promise<Subscriber[]> { return []; }
  async getSubscriber(id: string): Promise<Subscriber | undefined> { return undefined; }
  async getSubscriberByEmail(email: string): Promise<Subscriber | undefined> { return undefined; }
  async createSubscriber(subscriber: InsertSubscriber): Promise<Subscriber> { throw new Error("Not implemented"); }
  async updateSubscriber(id: string, updates: Partial<InsertSubscriber>): Promise<Subscriber | undefined> { return undefined; }
  async updateSubscriberStatus(id: string, status: string): Promise<Subscriber | undefined> { return undefined; }
  async deleteSubscriber(id: string): Promise<boolean> { return false; }
  async getAllCampaigns(): Promise<Campaign[]> { return []; }
  async getCampaign(id: string): Promise<Campaign | undefined> { return undefined; }
  async getCampaignsByNewsletterId(newsletterId: string): Promise<Campaign[]> { return []; }
  async createCampaign(campaign: InsertCampaign): Promise<Campaign> { throw new Error("Not implemented"); }
  async updateCampaign(id: string, updates: Partial<InsertCampaign>): Promise<Campaign | undefined> { return undefined; }
  async deleteCampaign(id: string): Promise<boolean> { return false; }
  async getDeliveriesByCampaignId(campaignId: string): Promise<Delivery[]> { return []; }
  async getDelivery(id: string): Promise<Delivery | undefined> { return undefined; }
  async createDelivery(delivery: InsertDelivery): Promise<Delivery> { throw new Error("Not implemented"); }
  async updateDelivery(id: string, updates: Partial<InsertDelivery>): Promise<Delivery | undefined> { return undefined; }
  async updateDeliveryStatus(id: string, status: string): Promise<Delivery | undefined> { return undefined; }
  async deleteDelivery(id: string): Promise<boolean> { return false; }

  // Blog Categories  
  async getAllBlogCategories(): Promise<BlogCategory[]> {
    const result = await db.select().from(blogCategories).orderBy(desc(blogCategories.createdAt));
    return result;
  }

  async getBlogCategory(id: string): Promise<BlogCategory | undefined> {
    const result = await db.select().from(blogCategories).where(eq(blogCategories.id, id)).limit(1);
    return result[0];
  }

  async createBlogCategory(category: InsertBlogCategory): Promise<BlogCategory> {
    const result = await db.insert(blogCategories).values(category).returning();
    return result[0];
  }

  async updateBlogCategory(id: string, updates: Partial<InsertBlogCategory>): Promise<BlogCategory | undefined> {
    const result = await db.update(blogCategories)
      .set(updates)
      .where(eq(blogCategories.id, id))
      .returning();
    return result[0];
  }

  async deleteBlogCategory(id: string): Promise<boolean> {
    const result = await db.delete(blogCategories).where(eq(blogCategories.id, id)).returning();
    return result.length > 0;
  }

  // Blog Posts
  async getAllBlogPosts(filters?: { categoryId?: string; isPublished?: boolean }): Promise<BlogPost[]> {
    const conditions = [];
    
    if (filters?.categoryId) {
      conditions.push(eq(blogPosts.categoryId, filters.categoryId));
    }
    if (filters?.isPublished !== undefined) {
      conditions.push(eq(blogPosts.isPublished, filters.isPublished));
    }
    
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    const result = await db.select()
      .from(blogPosts)
      .where(whereClause)
      .orderBy(desc(blogPosts.createdAt));
    
    return result;
  }

  async getBlogPost(id: string): Promise<BlogPost | undefined> {
    const result = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
    return result[0];
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const result = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug)).limit(1);
    return result[0];
  }

  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const result = await db.insert(blogPosts).values(post).returning();
    return result[0];
  }

  async updateBlogPost(id: string, updates: Partial<InsertBlogPost>): Promise<BlogPost | undefined> {
    const updateData = {
      ...updates,
      updatedAt: new Date(),
    };
    
    const result = await db.update(blogPosts)
      .set(updateData)
      .where(eq(blogPosts.id, id))
      .returning();
    return result[0];
  }

  async deleteBlogPost(id: string): Promise<boolean> {
    const result = await db.delete(blogPosts).where(eq(blogPosts.id, id)).returning();
    return result.length > 0;
  }

  async publishBlogPost(id: string): Promise<BlogPost | undefined> {
    const updateData = {
      isPublished: true,
      publishedAt: new Date(),
      updatedAt: new Date(),
    };
    
    const result = await db.update(blogPosts)
      .set(updateData)
      .where(eq(blogPosts.id, id))
      .returning();
    return result[0];
  }

  async incrementBlogPostViews(id: string): Promise<void> {
    await db.update(blogPosts)
      .set({ views: sql`${blogPosts.views} + 1` })
      .where(eq(blogPosts.id, id));
  }

  // GDPR Audit Logging Methods
  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const result = await db.insert(auditLogs).values(log).returning();
    return result[0];
  }

  async getAuditLogs(filters?: { userId?: string; resourceType?: string; action?: string; startDate?: Date; endDate?: Date }): Promise<AuditLog[]> {
    let query = db.select().from(auditLogs);

    if (filters) {
      const conditions = [];
      
      if (filters.userId) {
        conditions.push(eq(auditLogs.userId, filters.userId));
      }
      if (filters.resourceType) {
        conditions.push(eq(auditLogs.resourceType, filters.resourceType));
      }
      if (filters.action) {
        conditions.push(eq(auditLogs.action, filters.action));
      }
      // Add date filters if needed - would require additional imports from drizzle-orm

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }

    const result = await query.orderBy(desc(auditLogs.createdAt));
    return result;
  }

  async getAuditLogsByResourceId(resourceId: string): Promise<AuditLog[]> {
    const result = await db.select()
      .from(auditLogs)
      .where(eq(auditLogs.resourceId, resourceId))
      .orderBy(desc(auditLogs.createdAt));
    
    return result;
  }

  // CQC Audit Management Methods
  async getAllCqcAudits(filters?: { auditType?: string; status?: string; auditorId?: string; branch?: string }): Promise<CqcAudit[]> {
    let query = db.select().from(cqcAudits);
    
    if (filters) {
      const conditions = [];
      
      if (filters.auditType) {
        conditions.push(eq(cqcAudits.auditType, filters.auditType));
      }
      if (filters.status) {
        conditions.push(eq(cqcAudits.status, filters.status));
      }
      if (filters.auditorId) {
        conditions.push(eq(cqcAudits.auditorId, filters.auditorId));
      }
      if (filters.branch) {
        conditions.push(eq(cqcAudits.branch, filters.branch));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }
    
    const result = await query.orderBy(desc(cqcAudits.createdAt));
    return result;
  }

  async getCqcAudit(id: string): Promise<CqcAudit | undefined> {
    const result = await db.select().from(cqcAudits).where(eq(cqcAudits.id, id)).limit(1);
    return result[0];
  }

  async createCqcAudit(audit: InsertCqcAudit): Promise<CqcAudit> {
    const result = await db.insert(cqcAudits).values(audit).returning();
    return result[0];
  }

  async updateCqcAudit(id: string, updates: Partial<InsertCqcAudit>): Promise<CqcAudit | undefined> {
    const updateData = {
      ...updates,
      updatedAt: new Date(),
    };
    
    const result = await db.update(cqcAudits)
      .set(updateData)
      .where(eq(cqcAudits.id, id))
      .returning();
    return result[0];
  }

  async deleteCqcAudit(id: string): Promise<boolean> {
    const result = await db.delete(cqcAudits).where(eq(cqcAudits.id, id)).returning();
    return result.length > 0;
  }

  // CQC Audit Categories Methods
  async getAllCqcAuditCategories(auditType?: string): Promise<CqcAuditCategory[]> {
    let query = db.select().from(cqcAuditCategories).where(eq(cqcAuditCategories.isActive, true));
    
    if (auditType) {
      query = query.where(and(eq(cqcAuditCategories.isActive, true), eq(cqcAuditCategories.auditType, auditType)));
    }
    
    const result = await query.orderBy(cqcAuditCategories.sortOrder);
    return result;
  }

  async getCqcAuditCategory(id: string): Promise<CqcAuditCategory | undefined> {
    const result = await db.select().from(cqcAuditCategories).where(eq(cqcAuditCategories.id, id)).limit(1);
    return result[0];
  }

  async createCqcAuditCategory(category: InsertCqcAuditCategory): Promise<CqcAuditCategory> {
    const result = await db.insert(cqcAuditCategories).values(category).returning();
    return result[0];
  }

  async updateCqcAuditCategory(id: string, updates: Partial<InsertCqcAuditCategory>): Promise<CqcAuditCategory | undefined> {
    const result = await db.update(cqcAuditCategories)
      .set(updates)
      .where(eq(cqcAuditCategories.id, id))
      .returning();
    return result[0];
  }

  async deleteCqcAuditCategory(id: string): Promise<boolean> {
    const result = await db.delete(cqcAuditCategories).where(eq(cqcAuditCategories.id, id)).returning();
    return result.length > 0;
  }

  // CQC Checklist Items Methods
  async getCqcChecklistItems(categoryId?: string): Promise<CqcChecklistItem[]> {
    let query = db.select().from(cqcChecklistItems).where(eq(cqcChecklistItems.isActive, true));
    
    if (categoryId) {
      query = query.where(and(eq(cqcChecklistItems.isActive, true), eq(cqcChecklistItems.categoryId, categoryId)));
    }
    
    const result = await query.orderBy(cqcChecklistItems.sortOrder);
    return result;
  }

  async getCqcChecklistItem(id: string): Promise<CqcChecklistItem | undefined> {
    const result = await db.select().from(cqcChecklistItems).where(eq(cqcChecklistItems.id, id)).limit(1);
    return result[0];
  }

  async createCqcChecklistItem(item: InsertCqcChecklistItem): Promise<CqcChecklistItem> {
    const result = await db.insert(cqcChecklistItems).values(item).returning();
    return result[0];
  }

  async updateCqcChecklistItem(id: string, updates: Partial<InsertCqcChecklistItem>): Promise<CqcChecklistItem | undefined> {
    const result = await db.update(cqcChecklistItems)
      .set(updates)
      .where(eq(cqcChecklistItems.id, id))
      .returning();
    return result[0];
  }

  async deleteCqcChecklistItem(id: string): Promise<boolean> {
    const result = await db.delete(cqcChecklistItems).where(eq(cqcChecklistItems.id, id)).returning();
    return result.length > 0;
  }

  // CQC Audit Responses Methods
  async getCqcAuditResponses(auditId: string): Promise<CqcAuditResponse[]> {
    const result = await db.select().from(cqcAuditResponses)
      .where(eq(cqcAuditResponses.auditId, auditId))
      .orderBy(desc(cqcAuditResponses.createdAt));
    return result;
  }

  async getCqcAuditResponse(id: string): Promise<CqcAuditResponse | undefined> {
    const result = await db.select().from(cqcAuditResponses).where(eq(cqcAuditResponses.id, id)).limit(1);
    return result[0];
  }

  async createCqcAuditResponse(response: InsertCqcAuditResponse): Promise<CqcAuditResponse> {
    const result = await db.insert(cqcAuditResponses).values(response).returning();
    return result[0];
  }

  async updateCqcAuditResponse(id: string, updates: Partial<InsertCqcAuditResponse>): Promise<CqcAuditResponse | undefined> {
    const updateData = {
      ...updates,
      updatedAt: new Date(),
    };
    
    const result = await db.update(cqcAuditResponses)
      .set(updateData)
      .where(eq(cqcAuditResponses.id, id))
      .returning();
    return result[0];
  }

  async deleteCqcAuditResponse(id: string): Promise<boolean> {
    const result = await db.delete(cqcAuditResponses).where(eq(cqcAuditResponses.id, id)).returning();
    return result.length > 0;
  }

  // CQC Compliance Records Methods
  async getAllCqcComplianceRecords(filters?: { staffId?: string; recordType?: string; status?: string; branch?: string }): Promise<CqcComplianceRecord[]> {
    let query = db.select().from(cqcComplianceRecords);
    
    if (filters) {
      const conditions = [];
      
      if (filters.staffId) {
        conditions.push(eq(cqcComplianceRecords.staffId, filters.staffId));
      }
      if (filters.recordType) {
        conditions.push(eq(cqcComplianceRecords.recordType, filters.recordType));
      }
      if (filters.status) {
        conditions.push(eq(cqcComplianceRecords.status, filters.status));
      }
      if (filters.branch) {
        conditions.push(eq(cqcComplianceRecords.branch, filters.branch));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }
    
    const result = await query.orderBy(desc(cqcComplianceRecords.createdAt));
    return result;
  }

  async getCqcComplianceRecord(id: string): Promise<CqcComplianceRecord | undefined> {
    const result = await db.select().from(cqcComplianceRecords).where(eq(cqcComplianceRecords.id, id)).limit(1);
    return result[0];
  }

  async createCqcComplianceRecord(record: InsertCqcComplianceRecord): Promise<CqcComplianceRecord> {
    const result = await db.insert(cqcComplianceRecords).values(record).returning();
    return result[0];
  }

  async updateCqcComplianceRecord(id: string, updates: Partial<InsertCqcComplianceRecord>): Promise<CqcComplianceRecord | undefined> {
    const updateData = {
      ...updates,
      updatedAt: new Date(),
    };
    
    const result = await db.update(cqcComplianceRecords)
      .set(updateData)
      .where(eq(cqcComplianceRecords.id, id))
      .returning();
    return result[0];
  }

  async deleteCqcComplianceRecord(id: string): Promise<boolean> {
    const result = await db.delete(cqcComplianceRecords).where(eq(cqcComplianceRecords.id, id)).returning();
    return result.length > 0;
  }

  // CQC 2024 Single Assessment Framework - Quality Statements Methods
  async getAllCqcQualityStatements(keyQuestion?: string): Promise<CqcQualityStatement[]> {
    let query = db.select().from(cqcQualityStatements);
    
    if (keyQuestion) {
      query = query.where(eq(cqcQualityStatements.keyQuestion, keyQuestion));
    }
    
    return await query.orderBy(cqcQualityStatements.statementNumber);
  }

  async getCqcQualityStatement(id: string): Promise<CqcQualityStatement | undefined> {
    const result = await db.select().from(cqcQualityStatements).where(eq(cqcQualityStatements.id, id)).limit(1);
    return result[0];
  }

  async createCqcQualityStatement(statement: InsertCqcQualityStatement): Promise<CqcQualityStatement> {
    const result = await db.insert(cqcQualityStatements).values(statement).returning();
    return result[0];
  }

  async updateCqcQualityStatement(id: string, updates: Partial<InsertCqcQualityStatement>): Promise<CqcQualityStatement | undefined> {
    const result = await db.update(cqcQualityStatements)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(cqcQualityStatements.id, id))
      .returning();
    return result[0];
  }

  async deleteCqcQualityStatement(id: string): Promise<boolean> {
    const result = await db.delete(cqcQualityStatements).where(eq(cqcQualityStatements.id, id)).returning();
    return result.length > 0;
  }

  // CQC 2024 Single Assessment Framework - Evidence Categories Methods
  async getAllCqcEvidenceCategories(): Promise<CqcEvidenceCategory[]> {
    return await db.select().from(cqcEvidenceCategories).orderBy(cqcEvidenceCategories.categoryName);
  }

  async getCqcEvidenceCategory(id: string): Promise<CqcEvidenceCategory | undefined> {
    const result = await db.select().from(cqcEvidenceCategories).where(eq(cqcEvidenceCategories.id, id)).limit(1);
    return result[0];
  }

  async createCqcEvidenceCategory(category: InsertCqcEvidenceCategory): Promise<CqcEvidenceCategory> {
    const result = await db.insert(cqcEvidenceCategories).values(category).returning();
    return result[0];
  }

  async updateCqcEvidenceCategory(id: string, updates: Partial<InsertCqcEvidenceCategory>): Promise<CqcEvidenceCategory | undefined> {
    const result = await db.update(cqcEvidenceCategories)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(cqcEvidenceCategories.id, id))
      .returning();
    return result[0];
  }

  async deleteCqcEvidenceCategory(id: string): Promise<boolean> {
    const result = await db.delete(cqcEvidenceCategories).where(eq(cqcEvidenceCategories.id, id)).returning();
    return result.length > 0;
  }

  // CQC 2024 Single Assessment Framework - Audit Evidence Methods
  async getAllCqcAuditEvidence(filters?: { auditId?: string; evidenceCategoryId?: string; qualityStatementId?: string }): Promise<CqcAuditEvidence[]> {
    let query = db.select().from(cqcAuditEvidence);
    
    if (filters) {
      const conditions = [];
      
      if (filters.auditId) {
        conditions.push(eq(cqcAuditEvidence.auditId, filters.auditId));
      }
      if (filters.evidenceCategoryId) {
        conditions.push(eq(cqcAuditEvidence.evidenceCategoryId, filters.evidenceCategoryId));
      }
      if (filters.qualityStatementId) {
        conditions.push(eq(cqcAuditEvidence.qualityStatementId, filters.qualityStatementId));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }
    
    return await query.orderBy(desc(cqcAuditEvidence.uploadedAt));
  }

  async getCqcAuditEvidence(id: string): Promise<CqcAuditEvidence | undefined> {
    const result = await db.select().from(cqcAuditEvidence).where(eq(cqcAuditEvidence.id, id)).limit(1);
    return result[0];
  }

  async createCqcAuditEvidence(evidence: InsertCqcAuditEvidence): Promise<CqcAuditEvidence> {
    const result = await db.insert(cqcAuditEvidence).values(evidence).returning();
    return result[0];
  }

  async updateCqcAuditEvidence(id: string, updates: Partial<InsertCqcAuditEvidence>): Promise<CqcAuditEvidence | undefined> {
    const result = await db.update(cqcAuditEvidence)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(cqcAuditEvidence.id, id))
      .returning();
    return result[0];
  }

  async deleteCqcAuditEvidence(id: string): Promise<boolean> {
    const result = await db.delete(cqcAuditEvidence).where(eq(cqcAuditEvidence.id, id)).returning();
    return result.length > 0;
  }

  // CQC 2024 Single Assessment Framework - Quality Assessments Methods
  async getAllCqcQualityAssessments(filters?: { auditId?: string; qualityStatementId?: string; assessmentRating?: string }): Promise<CqcQualityAssessment[]> {
    let query = db.select().from(cqcQualityAssessments);
    
    if (filters) {
      const conditions = [];
      
      if (filters.auditId) {
        conditions.push(eq(cqcQualityAssessments.auditId, filters.auditId));
      }
      if (filters.qualityStatementId) {
        conditions.push(eq(cqcQualityAssessments.qualityStatementId, filters.qualityStatementId));
      }
      if (filters.assessmentRating) {
        conditions.push(eq(cqcQualityAssessments.assessmentRating, filters.assessmentRating));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }
    
    return await query.orderBy(desc(cqcQualityAssessments.assessedAt));
  }

  async getCqcQualityAssessment(id: string): Promise<CqcQualityAssessment | undefined> {
    const result = await db.select().from(cqcQualityAssessments).where(eq(cqcQualityAssessments.id, id)).limit(1);
    return result[0];
  }

  async createCqcQualityAssessment(assessment: InsertCqcQualityAssessment): Promise<CqcQualityAssessment> {
    const result = await db.insert(cqcQualityAssessments).values(assessment).returning();
    return result[0];
  }

  async updateCqcQualityAssessment(id: string, updates: Partial<InsertCqcQualityAssessment>): Promise<CqcQualityAssessment | undefined> {
    const result = await db.update(cqcQualityAssessments)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(cqcQualityAssessments.id, id))
      .returning();
    return result[0];
  }

  async deleteCqcQualityAssessment(id: string): Promise<boolean> {
    const result = await db.delete(cqcQualityAssessments).where(eq(cqcQualityAssessments.id, id)).returning();
    return result.length > 0;
  }

  // Staff Knowledge Assessment Methods
  async getAllKnowledgeQuestionnaires(filters?: { category?: string; subcategory?: string; isActive?: boolean }): Promise<KnowledgeQuestionnaire[]> {
    let query = db.select().from(knowledgeQuestionnaires);
    
    if (filters) {
      const conditions = [];
      
      if (filters.category) {
        conditions.push(eq(knowledgeQuestionnaires.category, filters.category));
      }
      if (filters.subcategory) {
        conditions.push(eq(knowledgeQuestionnaires.subcategory, filters.subcategory));
      }
      if (filters.isActive !== undefined) {
        conditions.push(eq(knowledgeQuestionnaires.isActive, filters.isActive));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }
    
    const result = await query.orderBy(desc(knowledgeQuestionnaires.createdAt));
    return result;
  }

  async getKnowledgeQuestionnaire(id: string): Promise<KnowledgeQuestionnaire | undefined> {
    const result = await db.select().from(knowledgeQuestionnaires).where(eq(knowledgeQuestionnaires.id, id)).limit(1);
    return result[0];
  }

  async getKnowledgeQuestionnaireByShareableLink(shareableLink: string): Promise<KnowledgeQuestionnaire | undefined> {
    const result = await db.select().from(knowledgeQuestionnaires).where(eq(knowledgeQuestionnaires.shareableLink, shareableLink)).limit(1);
    return result[0];
  }

  async createKnowledgeQuestionnaire(questionnaire: InsertKnowledgeQuestionnaire): Promise<KnowledgeQuestionnaire> {
    const result = await db.insert(knowledgeQuestionnaires).values(questionnaire).returning();
    return result[0];
  }

  async updateKnowledgeQuestionnaire(id: string, updates: Partial<InsertKnowledgeQuestionnaire>): Promise<KnowledgeQuestionnaire | undefined> {
    const updateData = {
      ...updates,
      updatedAt: new Date(),
    };
    
    const result = await db.update(knowledgeQuestionnaires)
      .set(updateData)
      .where(eq(knowledgeQuestionnaires.id, id))
      .returning();
    return result[0];
  }

  async deleteKnowledgeQuestionnaire(id: string): Promise<boolean> {
    const result = await db.delete(knowledgeQuestionnaires).where(eq(knowledgeQuestionnaires.id, id)).returning();
    return result.length > 0;
  }

  // Knowledge Questions Methods
  async getKnowledgeQuestions(questionnaireId: string): Promise<KnowledgeQuestion[]> {
    const result = await db.select().from(knowledgeQuestions)
      .where(eq(knowledgeQuestions.questionnaireId, questionnaireId))
      .orderBy(knowledgeQuestions.sortOrder);
    return result;
  }

  async getKnowledgeQuestion(id: string): Promise<KnowledgeQuestion | undefined> {
    const result = await db.select().from(knowledgeQuestions).where(eq(knowledgeQuestions.id, id)).limit(1);
    return result[0];
  }

  async createKnowledgeQuestion(question: InsertKnowledgeQuestion): Promise<KnowledgeQuestion> {
    const result = await db.insert(knowledgeQuestions).values(question).returning();
    return result[0];
  }

  async updateKnowledgeQuestion(id: string, updates: Partial<InsertKnowledgeQuestion>): Promise<KnowledgeQuestion | undefined> {
    const result = await db.update(knowledgeQuestions)
      .set(updates)
      .where(eq(knowledgeQuestions.id, id))
      .returning();
    return result[0];
  }

  async deleteKnowledgeQuestion(id: string): Promise<boolean> {
    const result = await db.delete(knowledgeQuestions).where(eq(knowledgeQuestions.id, id)).returning();
    return result.length > 0;
  }

  // Knowledge Sessions Methods
  async getAllKnowledgeSessions(filters?: { questionnaireId?: string; staffEmail?: string; status?: string }): Promise<KnowledgeSession[]> {
    let query = db.select().from(knowledgeSessions);
    
    if (filters) {
      const conditions = [];
      
      if (filters.questionnaireId) {
        conditions.push(eq(knowledgeSessions.questionnaireId, filters.questionnaireId));
      }
      if (filters.staffEmail) {
        conditions.push(eq(knowledgeSessions.staffEmail, filters.staffEmail));
      }
      if (filters.status) {
        conditions.push(eq(knowledgeSessions.status, filters.status));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }
    
    const result = await query.orderBy(desc(knowledgeSessions.createdAt));
    return result;
  }

  async getKnowledgeSession(id: string): Promise<KnowledgeSession | undefined> {
    const result = await db.select().from(knowledgeSessions).where(eq(knowledgeSessions.id, id)).limit(1);
    return result[0];
  }

  async createKnowledgeSession(session: InsertKnowledgeSession): Promise<KnowledgeSession> {
    const result = await db.insert(knowledgeSessions).values(session).returning();
    return result[0];
  }

  async updateKnowledgeSession(id: string, updates: Partial<InsertKnowledgeSession>): Promise<KnowledgeSession | undefined> {
    const result = await db.update(knowledgeSessions)
      .set(updates)
      .where(eq(knowledgeSessions.id, id))
      .returning();
    return result[0];
  }

  async deleteKnowledgeSession(id: string): Promise<boolean> {
    const result = await db.delete(knowledgeSessions).where(eq(knowledgeSessions.id, id)).returning();
    return result.length > 0;
  }

  // Knowledge Responses Methods
  async getKnowledgeResponses(sessionId: string): Promise<KnowledgeResponse[]> {
    const result = await db.select().from(knowledgeResponses)
      .where(eq(knowledgeResponses.sessionId, sessionId))
      .orderBy(desc(knowledgeResponses.createdAt));
    return result;
  }

  async getKnowledgeResponse(id: string): Promise<KnowledgeResponse | undefined> {
    const result = await db.select().from(knowledgeResponses).where(eq(knowledgeResponses.id, id)).limit(1);
    return result[0];
  }

  async createKnowledgeResponse(response: InsertKnowledgeResponse): Promise<KnowledgeResponse> {
    const result = await db.insert(knowledgeResponses).values(response).returning();
    return result[0];
  }

  async updateKnowledgeResponse(id: string, updates: Partial<InsertKnowledgeResponse>): Promise<KnowledgeResponse | undefined> {
    const result = await db.update(knowledgeResponses)
      .set(updates)
      .where(eq(knowledgeResponses.id, id))
      .returning();
    return result[0];
  }

  async deleteKnowledgeResponse(id: string): Promise<boolean> {
    const result = await db.delete(knowledgeResponses).where(eq(knowledgeResponses.id, id)).returning();
    return result.length > 0;
  }

  // Knowledge Actions Methods
  async getAllKnowledgeActions(filters?: { sessionId?: string; assignedTo?: string; status?: string }): Promise<KnowledgeAction[]> {
    let query = db.select().from(knowledgeActions);
    
    if (filters) {
      const conditions = [];
      
      if (filters.sessionId) {
        conditions.push(eq(knowledgeActions.sessionId, filters.sessionId));
      }
      if (filters.assignedTo) {
        conditions.push(eq(knowledgeActions.assignedTo, filters.assignedTo));
      }
      if (filters.status) {
        conditions.push(eq(knowledgeActions.status, filters.status));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }
    
    const result = await query.orderBy(desc(knowledgeActions.createdAt));
    return result;
  }

  async getKnowledgeAction(id: string): Promise<KnowledgeAction | undefined> {
    const result = await db.select().from(knowledgeActions).where(eq(knowledgeActions.id, id)).limit(1);
    return result[0];
  }

  async createKnowledgeAction(action: InsertKnowledgeAction): Promise<KnowledgeAction> {
    const result = await db.insert(knowledgeActions).values(action).returning();
    return result[0];
  }

  async updateKnowledgeAction(id: string, updates: Partial<InsertKnowledgeAction>): Promise<KnowledgeAction | undefined> {
    const updateData = {
      ...updates,
      updatedAt: new Date(),
    };
    
    const result = await db.update(knowledgeActions)
      .set(updateData)
      .where(eq(knowledgeActions.id, id))
      .returning();
    return result[0];
  }

  async deleteKnowledgeAction(id: string): Promise<boolean> {
    const result = await db.delete(knowledgeActions).where(eq(knowledgeActions.id, id)).returning();
    return result.length > 0;
  }

  // Finance Reports
  async getAllFinanceReports(): Promise<FinanceReport[]> {
    return await db.select().from(financeReports).orderBy(desc(financeReports.reportMonth));
  }

  async getFinanceReport(id: string): Promise<FinanceReport | undefined> {
    const result = await db.select().from(financeReports).where(eq(financeReports.id, id)).limit(1);
    return result[0];
  }

  async getFinanceReportByMonth(reportMonth: string): Promise<FinanceReport | undefined> {
    const result = await db.select().from(financeReports).where(eq(financeReports.reportMonth, reportMonth)).limit(1);
    return result[0];
  }

  async createFinanceReport(report: InsertFinanceReport): Promise<FinanceReport> {
    const result = await db.insert(financeReports).values(report).returning();
    return result[0];
  }

  async updateFinanceReport(id: string, updates: Partial<InsertFinanceReport>): Promise<FinanceReport | undefined> {
    const result = await db.update(financeReports)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(financeReports.id, id))
      .returning();
    return result[0];
  }

  async deleteFinanceReport(id: string): Promise<boolean> {
    const result = await db.delete(financeReports).where(eq(financeReports.id, id)).returning();
    return result.length > 0;
  }

  // Route Planning - Geocoding Cache
  async getGeocode(cacheKey: string): Promise<Geocode | undefined> {
    const result = await db.select().from(geocodeCache)
      .where(eq(geocodeCache.cacheKey, cacheKey))
      .limit(1);
    return result[0];
  }

  async createGeocode(geocode: InsertGeocode): Promise<Geocode> {
    const result = await db.insert(geocodeCache).values(geocode).returning();
    return result[0];
  }

  async updateGeocode(id: string, updates: Partial<InsertGeocode>): Promise<Geocode | undefined> {
    const updateData = {
      ...updates,
      updatedAt: new Date(),
    };
    
    const result = await db.update(geocodeCache)
      .set(updateData)
      .where(eq(geocodeCache.id, id))
      .returning();
    return result[0];
  }

  // Route Planning - Clients
  async getAllClients(filters?: { isActive?: boolean; postcode?: string }): Promise<Client[]> {
    let query = db.select().from(clients);
    
    if (filters?.isActive !== undefined) {
      query = query.where(eq(clients.isActive, filters.isActive));
    }
    
    if (filters?.postcode) {
      query = query.where(eq(clients.postcode, filters.postcode));
    }
    
    return await query.orderBy(clients.name);
  }

  async createClient(client: InsertClient): Promise<Client> {
    const result = await db.insert(clients).values(client).returning();
    return result[0];
  }

  // Route Planning - Visits
  async getAllVisits(filters?: { date?: string; clientId?: string; timeSlot?: string; status?: string }): Promise<Visit[]> {
    let query = db.select().from(visits);
    
    if (filters?.date) {
      query = query.where(eq(visits.visitDate, filters.date));
    }
    
    if (filters?.clientId) {
      query = query.where(eq(visits.clientId, filters.clientId));
    }
    
    if (filters?.timeSlot) {
      query = query.where(eq(visits.timeSlot, filters.timeSlot));
    }
    
    if (filters?.status) {
      query = query.where(eq(visits.status, filters.status));
    }
    
    return await query.orderBy(visits.visitDate, visits.timeSlot);
  }

  async createVisit(visit: InsertVisit): Promise<Visit> {
    const result = await db.insert(visits).values(visit).returning();
    return result[0];
  }

  // Route Planning - Runs
  async getAllRuns(filters?: { date?: string; travelMode?: string; status?: string; createdBy?: string }): Promise<Run[]> {
    let query = db.select().from(runs);
    
    if (filters?.date) {
      const targetDate = new Date(filters.date);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
      query = query.where(and(
        gte(runs.date, startOfDay),
        lte(runs.date, endOfDay)
      ));
    }
    
    if (filters?.travelMode) {
      query = query.where(eq(runs.travelMode, filters.travelMode));
    }
    
    if (filters?.status) {
      query = query.where(eq(runs.status, filters.status));
    }
    
    if (filters?.createdBy) {
      query = query.where(eq(runs.createdBy, filters.createdBy));
    }
    
    return await query.orderBy(desc(runs.createdAt));
  }

  async getRun(id: string): Promise<Run | undefined> {
    const result = await db.select().from(runs)
      .where(eq(runs.id, id))
      .limit(1);
    return result[0];
  }

  async createRun(run: InsertRun): Promise<Run> {
    // TEMPORARY FIX: Exclude travelMode field until database schema is synced
    // The travelMode column exists in code schema but not in database yet
    const { travelMode, ...runWithoutTravelMode } = run;
    
    try {
      const result = await db.insert(runs).values(run).returning();
      return result[0];
    } catch (error: any) {
      // If travelMode column doesn't exist, try without it
      if (error?.code === '42703' && error?.message?.includes('travel_mode')) {
        console.warn('Database missing travel_mode column, inserting without it (temporary fix)');
        const result = await db.insert(runs).values(runWithoutTravelMode).returning();
        // Add the travelMode back to the returned object for consistency
        return { ...result[0], travelMode: travelMode || 'walking' };
      }
      throw error;
    }
  }

  // Route Planning - Run Stops
  async getRunStops(runId: string): Promise<RunStop[]> {
    return await db.select().from(runStops)
      .where(eq(runStops.runId, runId))
      .orderBy(runStops.stopOrder);
  }

  async createRunStop(runStop: InsertRunStop): Promise<RunStop> {
    const result = await db.insert(runStops).values(runStop).returning();
    return result[0];
  }

  async deleteRunStops(runId: string): Promise<boolean> {
    const result = await db.delete(runStops).where(eq(runStops.runId, runId)).returning();
    return result.length > 0;
  }

  async deleteRun(id: string): Promise<boolean> {
    const result = await db.delete(runs).where(eq(runs.id, id)).returning();
    return result.length > 0;
  }

  // Reference Requests
  async getAllReferenceRequests(filters?: { status?: string }): Promise<ReferenceRequest[]> {
    let query = db.select().from(referenceRequests);
    
    if (filters?.status) {
      query = query.where(eq(referenceRequests.status, filters.status));
    }
    
    return await query.orderBy(desc(referenceRequests.createdAt));
  }

  async getReferenceRequest(id: string): Promise<ReferenceRequest | undefined> {
    const result = await db.select().from(referenceRequests)
      .where(eq(referenceRequests.id, id))
      .limit(1);
    return result[0];
  }

  async getReferenceRequestByToken(token: string): Promise<ReferenceRequest | undefined> {
    const result = await db.select().from(referenceRequests)
      .where(eq(referenceRequests.token, token))
      .limit(1);
    return result[0];
  }

  async createReferenceRequest(request: InsertReferenceRequest): Promise<ReferenceRequest> {
    const result = await db.insert(referenceRequests).values(request).returning();
    return result[0];
  }

  async updateReferenceRequest(id: string, updates: Partial<InsertReferenceRequest>): Promise<ReferenceRequest | undefined> {
    const result = await db.update(referenceRequests)
      .set(updates)
      .where(eq(referenceRequests.id, id))
      .returning();
    return result[0];
  }

  async updateReferenceRequestStatus(id: string, status: string): Promise<ReferenceRequest | undefined> {
    const updateData: any = { status };
    
    if (status === 'requested') {
      updateData.requestedAt = new Date();
    } else if (status === 'received') {
      updateData.receivedAt = new Date();
    }
    
    const result = await db.update(referenceRequests)
      .set(updateData)
      .where(eq(referenceRequests.id, id))
      .returning();
    return result[0];
  }

  async deleteReferenceRequest(id: string): Promise<boolean> {
    const result = await db.delete(referenceRequests).where(eq(referenceRequests.id, id)).returning();
    return result.length > 0;
  }

  // Service Improvement Plan (SIP) - DatabaseStorage implementations
  async getAllServiceImprovementPlanItems(filters?: { status?: string; priority?: string; cqcDomain?: string; branch?: string }): Promise<ServiceImprovementPlanItem[]> {
    let query = db.select().from(serviceImprovementPlanItems);
    
    const conditions = [];
    if (filters?.status) conditions.push(eq(serviceImprovementPlanItems.status, filters.status));
    if (filters?.priority) conditions.push(eq(serviceImprovementPlanItems.priority, filters.priority));
    if (filters?.cqcDomain) conditions.push(eq(serviceImprovementPlanItems.cqcDomain, filters.cqcDomain));
    if (filters?.branch) conditions.push(eq(serviceImprovementPlanItems.branch, filters.branch));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(desc(serviceImprovementPlanItems.createdAt));
  }

  async getServiceImprovementPlanItem(id: string): Promise<ServiceImprovementPlanItem | undefined> {
    const result = await db.select().from(serviceImprovementPlanItems)
      .where(eq(serviceImprovementPlanItems.id, id))
      .limit(1);
    return result[0];
  }

  async createServiceImprovementPlanItem(item: InsertServiceImprovementPlanItem): Promise<ServiceImprovementPlanItem> {
    const refNumber = await this.getNextSipReferenceNumber();
    const result = await db.insert(serviceImprovementPlanItems).values({
      ...item,
      referenceNumber: refNumber,
    }).returning();
    return result[0];
  }

  async updateServiceImprovementPlanItem(id: string, updates: UpdateServiceImprovementPlanItem): Promise<ServiceImprovementPlanItem | undefined> {
    const result = await db.update(serviceImprovementPlanItems)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(serviceImprovementPlanItems.id, id))
      .returning();
    return result[0];
  }

  async completeServiceImprovementPlanItem(id: string, completedBy: string): Promise<ServiceImprovementPlanItem | undefined> {
    const existing = await this.getServiceImprovementPlanItem(id);
    if (!existing) return undefined;
    
    const now = new Date();
    const updateEntry = {
      date: now.toISOString(),
      update: 'Marked as completed',
      updatedBy: completedBy
    };
    
    const result = await db.update(serviceImprovementPlanItems)
      .set({
        status: 'completed',
        completedDate: now,
        progressPercentage: 100,
        updatedAt: now,
        updateHistory: [...(existing.updateHistory || []), updateEntry],
      })
      .where(eq(serviceImprovementPlanItems.id, id))
      .returning();
    return result[0];
  }

  async deleteServiceImprovementPlanItem(id: string): Promise<boolean> {
    const result = await db.delete(serviceImprovementPlanItems).where(eq(serviceImprovementPlanItems.id, id)).returning();
    return result.length > 0;
  }

  async getNextSipReferenceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const allItems = await db.select().from(serviceImprovementPlanItems);
    const yearItems = allItems.filter(i => i.referenceNumber.includes(`SIP-${year}`));
    const nextNum = yearItems.length + 1;
    return `SIP-${year}-${String(nextNum).padStart(3, '0')}`;
  }

  // CQC Feedback Campaigns
  async getAllCqcFeedbackCampaigns(filters?: { category?: string; status?: string; branch?: string }): Promise<CqcFeedbackCampaign[]> {
    const conditions = [];
    if (filters?.category) conditions.push(eq(cqcFeedbackCampaigns.category, filters.category));
    if (filters?.status) conditions.push(eq(cqcFeedbackCampaigns.status, filters.status));
    if (filters?.branch) conditions.push(eq(cqcFeedbackCampaigns.branch, filters.branch));
    
    const query = conditions.length > 0
      ? db.select().from(cqcFeedbackCampaigns).where(and(...conditions)).orderBy(desc(cqcFeedbackCampaigns.createdAt))
      : db.select().from(cqcFeedbackCampaigns).orderBy(desc(cqcFeedbackCampaigns.createdAt));
    
    return await query;
  }

  async getCqcFeedbackCampaign(id: string): Promise<CqcFeedbackCampaign | undefined> {
    const result = await db.select().from(cqcFeedbackCampaigns)
      .where(eq(cqcFeedbackCampaigns.id, id))
      .limit(1);
    return result[0];
  }

  async getCqcFeedbackCampaignByToken(token: string): Promise<CqcFeedbackCampaign | undefined> {
    const result = await db.select().from(cqcFeedbackCampaigns)
      .where(eq(cqcFeedbackCampaigns.linkToken, token))
      .limit(1);
    return result[0];
  }

  async createCqcFeedbackCampaign(campaign: InsertCqcFeedbackCampaign): Promise<CqcFeedbackCampaign> {
    const result = await db.insert(cqcFeedbackCampaigns).values(campaign).returning();
    return result[0];
  }

  async updateCqcFeedbackCampaign(id: string, updates: UpdateCqcFeedbackCampaign): Promise<CqcFeedbackCampaign | undefined> {
    const result = await db.update(cqcFeedbackCampaigns)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(cqcFeedbackCampaigns.id, id))
      .returning();
    return result[0];
  }

  async deleteCqcFeedbackCampaign(id: string): Promise<boolean> {
    const result = await db.delete(cqcFeedbackCampaigns).where(eq(cqcFeedbackCampaigns.id, id)).returning();
    return result.length > 0;
  }

  // CQC Feedback Responses
  async getAllCqcFeedbackResponses(filters?: { campaignId?: string; branch?: string; source?: string; status?: string }): Promise<CqcFeedbackResponse[]> {
    const conditions = [];
    if (filters?.campaignId) conditions.push(eq(cqcFeedbackResponses.campaignId, filters.campaignId));
    if (filters?.branch) conditions.push(eq(cqcFeedbackResponses.branch, filters.branch));
    if (filters?.source) conditions.push(eq(cqcFeedbackResponses.source, filters.source));
    if (filters?.status) conditions.push(eq(cqcFeedbackResponses.status, filters.status));
    
    const query = conditions.length > 0
      ? db.select().from(cqcFeedbackResponses).where(and(...conditions)).orderBy(desc(cqcFeedbackResponses.createdAt))
      : db.select().from(cqcFeedbackResponses).orderBy(desc(cqcFeedbackResponses.createdAt));
    
    return await query;
  }

  async getCqcFeedbackResponse(id: string): Promise<CqcFeedbackResponse | undefined> {
    const result = await db.select().from(cqcFeedbackResponses)
      .where(eq(cqcFeedbackResponses.id, id))
      .limit(1);
    return result[0];
  }

  async createCqcFeedbackResponse(response: InsertCqcFeedbackResponse): Promise<CqcFeedbackResponse> {
    const result = await db.insert(cqcFeedbackResponses).values(response).returning();
    // Increment campaign response count
    await db.update(cqcFeedbackCampaigns)
      .set({ responseCount: db.select({ count: cqcFeedbackResponses.id }).from(cqcFeedbackResponses).where(eq(cqcFeedbackResponses.campaignId, response.campaignId)) as any })
      .where(eq(cqcFeedbackCampaigns.id, response.campaignId));
    return result[0];
  }

  async updateCqcFeedbackResponse(id: string, updates: Partial<InsertCqcFeedbackResponse>): Promise<CqcFeedbackResponse | undefined> {
    const result = await db.update(cqcFeedbackResponses)
      .set(updates)
      .where(eq(cqcFeedbackResponses.id, id))
      .returning();
    return result[0];
  }

  async deleteCqcFeedbackResponse(id: string): Promise<boolean> {
    const result = await db.delete(cqcFeedbackResponses).where(eq(cqcFeedbackResponses.id, id)).returning();
    return result.length > 0;
  }

  async getCqcFeedbackCampaignStats(campaignId: string): Promise<{
    totalResponses: number;
    averageRating: number;
    npsScore: number;
    ratingDistribution: Record<number, number>;
    recommendPercentage: number;
  }> {
    const responses = await db.select().from(cqcFeedbackResponses)
      .where(eq(cqcFeedbackResponses.campaignId, campaignId));
    
    const ratingsWithValue = responses.filter(r => r.overallRating !== null && r.overallRating !== undefined);
    const npsResponses = responses.filter(r => r.npsScore !== null && r.npsScore !== undefined);
    const recommendResponses = responses.filter(r => r.wouldRecommend !== null && r.wouldRecommend !== undefined);
    
    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalRating = 0;
    ratingsWithValue.forEach(r => {
      const rating = r.overallRating!;
      ratingDistribution[rating] = (ratingDistribution[rating] || 0) + 1;
      totalRating += rating;
    });
    
    // Calculate NPS: (Promoters - Detractors) / Total * 100
    const promoters = npsResponses.filter(r => r.npsScore! >= 9).length;
    const detractors = npsResponses.filter(r => r.npsScore! <= 6).length;
    const npsScore = npsResponses.length > 0 ? ((promoters - detractors) / npsResponses.length) * 100 : 0;
    
    const recommendYes = recommendResponses.filter(r => r.wouldRecommend === true).length;
    const recommendPercentage = recommendResponses.length > 0 ? (recommendYes / recommendResponses.length) * 100 : 0;
    
    return {
      totalResponses: responses.length,
      averageRating: ratingsWithValue.length > 0 ? totalRating / ratingsWithValue.length : 0,
      npsScore: Math.round(npsScore),
      ratingDistribution,
      recommendPercentage: Math.round(recommendPercentage),
    };
  }

  // Audit Schedule Settings
  async getAllAuditScheduleSettings(filters?: { branch?: string }): Promise<AuditScheduleSettings[]> {
    const conditions = [];
    if (filters?.branch) conditions.push(eq(auditScheduleSettings.branch, filters.branch));
    
    const query = conditions.length > 0
      ? db.select().from(auditScheduleSettings).where(and(...conditions))
      : db.select().from(auditScheduleSettings);
    
    return await query;
  }

  async getAuditScheduleSettings(id: string): Promise<AuditScheduleSettings | undefined> {
    const result = await db.select().from(auditScheduleSettings)
      .where(eq(auditScheduleSettings.id, id))
      .limit(1);
    return result[0];
  }

  async getAuditScheduleSettingsByCategory(category: string, branch: string): Promise<AuditScheduleSettings | undefined> {
    const result = await db.select().from(auditScheduleSettings)
      .where(and(
        eq(auditScheduleSettings.category, category),
        eq(auditScheduleSettings.branch, branch)
      ))
      .limit(1);
    return result[0];
  }

  async createAuditScheduleSettings(settings: InsertAuditScheduleSettings): Promise<AuditScheduleSettings> {
    const result = await db.insert(auditScheduleSettings).values(settings).returning();
    return result[0];
  }

  async updateAuditScheduleSettings(id: string, updates: Partial<InsertAuditScheduleSettings>): Promise<AuditScheduleSettings | undefined> {
    const result = await db.update(auditScheduleSettings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(auditScheduleSettings.id, id))
      .returning();
    return result[0];
  }

  async upsertAuditScheduleSettings(settings: InsertAuditScheduleSettings): Promise<AuditScheduleSettings> {
    const existing = await this.getAuditScheduleSettingsByCategory(settings.category, settings.branch);
    if (existing) {
      return (await this.updateAuditScheduleSettings(existing.id, settings))!;
    }
    return this.createAuditScheduleSettings(settings);
  }

  async deleteAuditScheduleSettings(id: string): Promise<boolean> {
    const result = await db.delete(auditScheduleSettings)
      .where(eq(auditScheduleSettings.id, id))
      .returning();
    return result.length > 0;
  }
}

// Use database storage for production
export const storage = new DrizzleStorage();
