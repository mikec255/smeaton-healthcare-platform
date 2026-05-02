/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Smeaton Healthcare — CareLogr API Client
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Drop this file into your CareLogr Replit project and add two Secrets:
 *
 *   SMEATON_API_KEY  = clgr_e17439bf4d355423d437d047611f10e8124c5a9f15ac55aa7690da8df011a14a
 *   SMEATON_BASE_URL = https://www.smeatonhealthcare.co.uk/api/carelogr
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Quick-start
 * ─────────────────────────────────────────────────────────────────────────
 *
 *   const { SmeatonAPI } = require('./smeaton-api');
 *   const api = new SmeatonAPI();
 *
 *   // Check connection
 *   const status = await api.health();
 *
 *   // Website enquiries
 *   const all    = await api.getEnquiries();
 *   const newOnes = await api.getEnquiries({ status: 'new' });
 *   await api.updateEnquiry(id, { status: 'contacted' });
 *
 *   // Jobs
 *   const jobs = await api.getJobs({ isActive: true });
 *   const job  = await api.createJob({ title: 'Care Assistant', ... });
 *   await api.updateJob(id, { isActive: false });
 *   await api.deleteJob(id);
 *
 *   // Applications
 *   const apps = await api.getApplications({ status: 'pending' });
 *   await api.reviewApplication(id, { status: 'interview', notes: 'Call Monday' });
 *
 *   // Blog categories
 *   const cats = await api.getBlogCategories();
 *   const cat  = await api.createBlogCategory({ name: 'Company News' });
 *   await api.updateBlogCategory(id, { name: 'News & Updates' });
 *   await api.deleteBlogCategory(id);
 *
 *   // Blog posts
 *   const posts = await api.getBlogPosts({ isPublished: true });
 *   const post  = await api.createBlogPost({ title: 'Hello World', slug: 'hello-world', categoryId: '...', author: 'Jane' });
 *   await api.updateBlogPost(id, { title: 'Updated Title' });
 *   await api.publishBlogPost(id);      // makes it live on the website
 *   await api.unpublishBlogPost(id);    // hides it (back to draft)
 *   await api.deleteBlogPost(id);
 *
 * ─────────────────────────────────────────────────────────────────────────
 * All responses follow the shape:  { success: true, data: ..., total?: N }
 * Errors throw a plain Error with a descriptive message.
 * ─────────────────────────────────────────────────────────────────────────
 */

'use strict';

class SmeatonAPI {

  constructor() {
    this.baseUrl = process.env.SMEATON_BASE_URL;
    this.apiKey  = process.env.SMEATON_API_KEY;

    if (!this.baseUrl) throw new Error('[SmeatonAPI] Missing SMEATON_BASE_URL in environment secrets.');
    if (!this.apiKey)  throw new Error('[SmeatonAPI] Missing SMEATON_API_KEY in environment secrets.');

    // Strip trailing slash so path joins are always clean
    this.baseUrl = this.baseUrl.replace(/\/$/, '');
  }

  // ─── Internal request helper ─────────────────────────────────────────────

  async #req(method, path, body = null) {
    const url = `${this.baseUrl}${path}`;
    const options = {
      method,
      headers: {
        'X-API-Key':     this.apiKey,
        'Content-Type':  'application/json',
        'Accept':        'application/json',
      },
    };

    if (body !== null && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    let res;
    try {
      res = await fetch(url, options);
    } catch (err) {
      throw new Error(`[SmeatonAPI] Network error on ${method} ${path}: ${err.message}`);
    }

    let json;
    try {
      json = await res.json();
    } catch {
      throw new Error(`[SmeatonAPI] Non-JSON response (HTTP ${res.status}) on ${method} ${path}`);
    }

    if (!res.ok || json.success === false) {
      const msg = json.message || json.error || `HTTP ${res.status}`;
      throw new Error(`[SmeatonAPI] ${method} ${path} — ${msg}`);
    }

    return json;
  }

  #qs(params = {}) {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== '') p.set(k, String(v));
    }
    const s = p.toString();
    return s ? `?${s}` : '';
  }


  // ═══════════════════════════════════════════════════════════════════════════
  // HEALTH
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Confirm the API is reachable and get version info.
   *
   * @returns {{ service, version, timestamp, resources[] }}
   *
   * @example
   *   const { data } = await api.health();
   *   console.log(data.service, data.version);
   */
  async health() {
    return this.#req('GET', '/health');
  }


  // ═══════════════════════════════════════════════════════════════════════════
  // ENQUIRIES  (website contact form submissions)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * List all website enquiries, newest first.
   *
   * @param {object} [filters]
   * @param {'new'|'contacted'|'quoted'|'closed'} [filters.status]
   *   Filter by workflow status.
   * @param {'care-request'|'staff-booking'} [filters.type]
   *   Filter by enquiry type.
   *
   * @returns {{ success, total, data: Enquiry[] }}
   *
   * @example
   *   const { data } = await api.getEnquiries({ status: 'new' });
   *   for (const e of data) console.log(e.name, e.email, e.message);
   */
  async getEnquiries(filters = {}) {
    return this.#req('GET', `/enquiries${this.#qs(filters)}`);
  }

  /**
   * Get a single enquiry by ID.
   *
   * @param {string} id
   * @returns {{ success, data: Enquiry }}
   *
   * @example
   *   const { data } = await api.getEnquiry('abc-123');
   */
  async getEnquiry(id) {
    return this.#req('GET', `/enquiries/${id}`);
  }

  /**
   * Update an enquiry's status (and optionally add a note).
   *
   * @param {string} id
   * @param {object} updates
   * @param {'new'|'contacted'|'quoted'|'closed'} [updates.status]
   * @param {string} [updates.notes]
   *
   * @returns {{ success, data: Enquiry }}
   *
   * @example
   *   await api.updateEnquiry('abc-123', { status: 'contacted', notes: 'Called — left voicemail' });
   */
  async updateEnquiry(id, updates) {
    return this.#req('PATCH', `/enquiries/${id}`, updates);
  }


  // ═══════════════════════════════════════════════════════════════════════════
  // JOBS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * List job listings on the Smeaton website.
   *
   * @param {object} [filters]
   * @param {boolean} [filters.isActive]  true = live vacancies, false = archived
   * @param {string}  [filters.location]  e.g. 'Plymouth'
   * @param {'permanent'|'care-at-home'|'temporary'} [filters.type]
   *
   * @returns {{ success, total, data: Job[] }}
   *
   * @example
   *   const { data } = await api.getJobs({ isActive: true });
   */
  async getJobs(filters = {}) {
    return this.#req('GET', `/jobs${this.#qs(filters)}`);
  }

  /**
   * Get a single job by ID.
   *
   * @param {string} id
   * @returns {{ success, data: Job }}
   */
  async getJob(id) {
    return this.#req('GET', `/jobs/${id}`);
  }

  /**
   * Create a new job listing on the Smeaton website.
   *
   * Required fields:
   *   title        {string}  e.g. 'Care Assistant'
   *   type         {'permanent'|'care-at-home'|'temporary'}
   *   location     {string}  e.g. 'Plymouth, Devon'
   *   salaryType   {'hourly'|'weekly'|'annual'}
   *   salaryMin    {number}  e.g. 12.5
   *   summary      {string}  One-line description shown in listings
   *   description  {string}  Full job description (HTML or plain text)
   *
   * Optional fields:
   *   salaryMax        {number}
   *   department       {string}
   *   requirements     {string}
   *   benefits         {string}
   *   reportsTo        {string}
   *   experienceLevel  {'entry'|'1-2-years'|'3-5-years'|'5-plus-years'}
   *   isActive         {boolean}  defaults true — set false to hide from site
   *
   * @param {object} jobData
   * @returns {{ success, data: Job }}
   *
   * @example
   *   const { data } = await api.createJob({
   *     title: 'Senior Care Assistant',
   *     type: 'permanent',
   *     location: 'Truro, Cornwall',
   *     salaryType: 'hourly',
   *     salaryMin: 13.00,
   *     salaryMax: 14.50,
   *     summary: 'Join our outstanding team in Truro.',
   *     description: '<p>We are looking for...</p>',
   *     experienceLevel: '1-2-years',
   *   });
   *   console.log('Created job:', data.id);
   */
  async createJob(jobData) {
    return this.#req('POST', '/jobs', jobData);
  }

  /**
   * Update an existing job — send only the fields you want to change.
   *
   * @param {string} id
   * @param {object} updates  Any subset of the createJob fields
   * @returns {{ success, data: Job }}
   *
   * @example
   *   // Archive a vacancy
   *   await api.updateJob('abc-123', { isActive: false });
   *
   *   // Bump the salary
   *   await api.updateJob('abc-123', { salaryMin: 13.50, salaryMax: 15.00 });
   */
  async updateJob(id, updates) {
    return this.#req('PATCH', `/jobs/${id}`, updates);
  }

  /**
   * Permanently delete a job listing and all its applications.
   *
   * @param {string} id
   * @returns {{ success, message }}
   *
   * @example
   *   await api.deleteJob('abc-123');
   */
  async deleteJob(id) {
    return this.#req('DELETE', `/jobs/${id}`);
  }


  // ═══════════════════════════════════════════════════════════════════════════
  // APPLICATIONS  (job applications submitted via the Smeaton website)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * List job applications, newest first.
   *
   * @param {object} [filters]
   * @param {string} [filters.jobId]
   *   Return only applications for a specific job.
   * @param {'pending'|'reviewed'|'interview'|'hired'|'rejected'} [filters.status]
   *   Filter by review status.
   *
   * @returns {{ success, total, data: Application[] }}
   *
   * @example
   *   // All unreviewed applications
   *   const { data } = await api.getApplications({ status: 'pending' });
   *
   *   // All applications for one job
   *   const { data } = await api.getApplications({ jobId: 'job-id-here' });
   */
  async getApplications(filters = {}) {
    return this.#req('GET', `/applications${this.#qs(filters)}`);
  }

  /**
   * Get a single application by ID.
   *
   * @param {string} id
   * @returns {{ success, data: Application }}
   */
  async getApplication(id) {
    return this.#req('GET', `/applications/${id}`);
  }

  /**
   * Review an application — update its status and/or add notes.
   *
   * @param {string} id
   * @param {object} updates
   * @param {'pending'|'reviewed'|'interview'|'hired'|'rejected'} [updates.status]
   * @param {string} [updates.notes]  Internal notes visible only to admins
   *
   * @returns {{ success, data: Application }}
   *
   * @example
   *   // Move to interview stage
   *   await api.reviewApplication('abc-123', {
   *     status: 'interview',
   *     notes: 'Invited to interview — Thursday 10am',
   *   });
   *
   *   // Reject
   *   await api.reviewApplication('abc-123', { status: 'rejected' });
   *
   *   // Hire
   *   await api.reviewApplication('abc-123', { status: 'hired' });
   */
  async reviewApplication(id, updates) {
    return this.#req('PATCH', `/applications/${id}`, updates);
  }


  // ═══════════════════════════════════════════════════════════════════════════
  // BLOG CATEGORIES
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * List all blog categories.
   *
   * @returns {{ success, total, data: BlogCategory[] }}
   *
   * @example
   *   const { data } = await api.getBlogCategories();
   */
  async getBlogCategories() {
    return this.#req('GET', '/blog/categories');
  }

  /**
   * Create a new blog category.
   *
   * @param {object} data
   * @param {string}  data.name         Category name, e.g. 'Company News'
   * @param {string}  [data.description]
   * @param {boolean} [data.isActive]   Defaults true
   *
   * @returns {{ success, data: BlogCategory }}
   *
   * @example
   *   const { data } = await api.createBlogCategory({ name: 'Staff Stories' });
   */
  async createBlogCategory(data) {
    return this.#req('POST', '/blog/categories', data);
  }

  /**
   * Update a blog category — send only the fields you want to change.
   *
   * @param {string} id
   * @param {object} updates  { name?, description?, isActive? }
   * @returns {{ success, data: BlogCategory }}
   *
   * @example
   *   await api.updateBlogCategory('cat-id', { name: 'News & Updates' });
   */
  async updateBlogCategory(id, updates) {
    return this.#req('PATCH', `/blog/categories/${id}`, updates);
  }

  /**
   * Delete a blog category.
   * Will fail if any blog posts are still assigned to it — reassign or delete
   * those posts first.
   *
   * @param {string} id
   * @returns {{ success, message }}
   *
   * @example
   *   await api.deleteBlogCategory('cat-id');
   */
  async deleteBlogCategory(id) {
    return this.#req('DELETE', `/blog/categories/${id}`);
  }


  // ═══════════════════════════════════════════════════════════════════════════
  // BLOG POSTS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * List blog posts.
   *
   * Response includes summary stats alongside the post list:
   *   { success, total, published, drafts, totalViews, data: BlogPost[] }
   *
   * @param {object} [filters]
   * @param {boolean} [filters.isPublished]  true = live posts, false = drafts
   * @param {string}  [filters.categoryId]   Filter by category ID
   *
   * @example
   *   // All live posts
   *   const res = await api.getBlogPosts({ isPublished: true });
   *   console.log(`${res.published} live, ${res.drafts} drafts, ${res.totalViews} total views`);
   *
   *   // All drafts
   *   const { data } = await api.getBlogPosts({ isPublished: false });
   */
  async getBlogPosts(filters = {}) {
    return this.#req('GET', `/blog/posts${this.#qs(filters)}`);
  }

  /**
   * Get a single blog post by its database ID.
   *
   * @param {string} id
   * @returns {{ success, data: BlogPost }}
   */
  async getBlogPost(id) {
    return this.#req('GET', `/blog/posts/${id}`);
  }

  /**
   * Get a single blog post by its URL slug (e.g. 'our-care-team-2025').
   *
   * @param {string} slug
   * @returns {{ success, data: BlogPost }}
   *
   * @example
   *   const { data } = await api.getBlogPostBySlug('christmas-card-competitions');
   */
  async getBlogPostBySlug(slug) {
    return this.#req('GET', `/blog/posts/slug/${slug}`);
  }

  /**
   * Create a new blog post.
   * Posts are saved as drafts — not visible on the site until you call publishBlogPost().
   *
   * Required fields:
   *   title       {string}  Post headline
   *   slug        {string}  URL-friendly identifier, e.g. 'my-post-title-2025'
   *                         Must be unique. Use lowercase letters, numbers, hyphens only.
   *   categoryId  {string}  ID of an existing blog category
   *   author      {string}  Author display name, e.g. 'Jane Smith'
   *
   * Optional fields:
   *   excerpt   {string}  Short summary shown in post listings (1–2 sentences)
   *   content   {string}  Full post body as HTML
   *   readTime  {string}  e.g. '4 min read'
   *   imagePath {string}  URL or path of the featured image
   *   isActive  {boolean} Defaults true
   *
   * @param {object} postData
   * @returns {{ success, data: BlogPost }}
   *
   * @example
   *   const { data } = await api.createBlogPost({
   *     title:      'Top Tips for Choosing a Care Provider',
   *     slug:       'top-tips-choosing-care-provider',
   *     categoryId: 'cat-id-here',
   *     author:     'Sarah Jones',
   *     excerpt:    'Choosing the right care provider is one of the most important decisions a family can make.',
   *     content:    '<h2>Start with your needs</h2><p>...</p>',
   *     readTime:   '6 min read',
   *   });
   *   console.log('Draft created:', data.id);
   *
   *   // Publish immediately
   *   await api.publishBlogPost(data.id);
   */
  async createBlogPost(postData) {
    return this.#req('POST', '/blog/posts', postData);
  }

  /**
   * Update any fields on a blog post — send only the fields you want to change.
   * Works on both drafts and published posts.
   *
   * @param {string} id
   * @param {object} updates  Any subset of the createBlogPost fields
   * @returns {{ success, data: BlogPost }}
   *
   * @example
   *   await api.updateBlogPost('post-id', { title: 'Revised Title', readTime: '5 min read' });
   */
  async updateBlogPost(id, updates) {
    return this.#req('PATCH', `/blog/posts/${id}`, updates);
  }

  /**
   * Publish a blog post — makes it immediately visible on the Smeaton website.
   * Sets isPublished = true and records the publishedAt timestamp.
   *
   * @param {string} id
   * @returns {{ success, data: BlogPost }}
   *
   * @example
   *   await api.publishBlogPost('post-id');
   */
  async publishBlogPost(id) {
    return this.#req('POST', `/blog/posts/${id}/publish`);
  }

  /**
   * Unpublish a blog post — hides it from the website (reverts to draft).
   * All content is kept; it simply becomes invisible to visitors.
   *
   * @param {string} id
   * @returns {{ success, data: BlogPost }}
   *
   * @example
   *   await api.unpublishBlogPost('post-id');
   */
  async unpublishBlogPost(id) {
    return this.#req('POST', `/blog/posts/${id}/unpublish`);
  }

  /**
   * Record a page view for a blog post.
   * Call this once each time a visitor loads the post page.
   *
   * @param {string} id
   * @returns {{ success, viewCount: number }}
   *
   * @example
   *   const { viewCount } = await api.recordBlogView('post-id');
   *   console.log('Total views:', viewCount);
   */
  async recordBlogView(id) {
    return this.#req('POST', `/blog/posts/${id}/view`);
  }

  /**
   * Permanently delete a blog post.
   * This cannot be undone.
   *
   * @param {string} id
   * @returns {{ success, message }}
   *
   * @example
   *   await api.deleteBlogPost('post-id');
   */
  async deleteBlogPost(id) {
    return this.#req('DELETE', `/blog/posts/${id}`);
  }

}

module.exports = { SmeatonAPI };


// ─────────────────────────────────────────────────────────────────────────────
// Self-test — run `node smeaton-api.js` from CareLogr to verify the connection
// ─────────────────────────────────────────────────────────────────────────────
if (require.main === module) {
  (async () => {
    try {
      const api = new SmeatonAPI();

      // Health
      const h = await api.health();
      console.log(`\n✅  Connected to: ${h.data?.service || h.service}  (v${h.data?.version || h.version})`);

      // Enquiries
      const enq = await api.getEnquiries();
      console.log(`\n📬  Enquiries`);
      console.log(`    Total : ${enq.total}`);
      const byStatus = ['new','contacted','quoted','closed'].map(s => {
        const n = enq.data.filter(e => e.status === s).length;
        return `${s}: ${n}`;
      }).join('  |  ');
      console.log(`    ${byStatus}`);

      // Jobs
      const jobs = await api.getJobs();
      const activeJobs = await api.getJobs({ isActive: true });
      console.log(`\n💼  Jobs`);
      console.log(`    Total : ${jobs.total}  |  Active: ${activeJobs.total}`);

      // Applications
      const apps = await api.getApplications();
      console.log(`\n📋  Applications`);
      console.log(`    Total : ${apps.total}`);
      const byAppStatus = ['pending','reviewed','interview','hired','rejected'].map(s => {
        const n = apps.data.filter(a => a.status === s).length;
        return `${s}: ${n}`;
      }).join('  |  ');
      console.log(`    ${byAppStatus}`);

      // Blog
      const cats  = await api.getBlogCategories();
      const posts = await api.getBlogPosts();
      console.log(`\n📝  Blog`);
      console.log(`    Categories : ${cats.total}`);
      console.log(`    Posts      : ${posts.total} total  |  ${posts.published} published  |  ${posts.drafts} drafts  |  ${posts.totalViews} total views`);

      console.log(`\n✅  All resources reachable.\n`);

    } catch (err) {
      console.error(`\n❌  ${err.message}\n`);
      process.exit(1);
    }
  })();
}
