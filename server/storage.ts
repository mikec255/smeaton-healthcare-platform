import { type User, type InsertUser, type Job, type InsertJob, type Application, type InsertApplication, type ContactSubmission, type InsertContactSubmission, type Feedback, type InsertFeedback, type Newsletter, type InsertNewsletter, type NewsletterBlock, type InsertNewsletterBlock, type Template, type InsertTemplate, type Subscriber, type InsertSubscriber, type Campaign, type InsertCampaign, type Delivery, type InsertDelivery, type BlogCategory, type InsertBlogCategory, type BlogPost, type InsertBlogPost } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { users, jobs, applications, contactSubmissions, blogCategories, blogPosts } from "@shared/schema";
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
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private jobs: Map<string, Job>;
  private applications: Map<string, Application>;
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

  constructor() {
    this.users = new Map();
    this.jobs = new Map();
    this.applications = new Map();
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
}

// Use database storage for production
export const storage = new DrizzleStorage();
