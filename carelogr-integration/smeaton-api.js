/**
 * Smeaton Healthcare API Client
 * ─────────────────────────────
 * Drop this file into your CareLogr Replit project.
 *
 * Setup — add these two keys to CareLogr's Replit Secrets:
 *   SMEATON_API_KEY  = clgr_e17439bf4d355423d437d047611f10e8124c5a9f15ac55aa7690da8df011a14a
 *   SMEATON_BASE_URL = https://ff2b305e-a39b-4452-8770-c986e5e4bcf4-00-164v8ay1wakf2.janeway.replit.dev/api/carelogr
 *
 * NOTE: Once the Smeaton site is published, swap SMEATON_BASE_URL for the live .replit.app URL.
 *
 * Usage:
 *   const { SmeatonAPI } = require('./smeaton-api');
 *   const api = new SmeatonAPI();
 *
 *   // Enquiries
 *   const enquiries = await api.getEnquiries({ status: 'new' });
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
 *   await api.updateApplication(id, { status: 'interview', notes: 'Called Monday' });
 *
 *   // Blog categories
 *   const cats = await api.getBlogCategories();
 *   const cat  = await api.createBlogCategory({ name: 'News' });
 *   await api.updateBlogCategory(id, { name: 'Company News' });
 *   await api.deleteBlogCategory(id);
 *
 *   // Blog posts
 *   const posts = await api.getBlogPosts({ isPublished: true });
 *   const post  = await api.createBlogPost({ title: 'Hello', categoryId: '...', author: 'Jane', ... });
 *   await api.updateBlogPost(id, { title: 'Updated title' });
 *   await api.publishBlogPost(id);       // makes it live on the website
 *   await api.unpublishBlogPost(id);     // hides it from the website
 *   await api.recordBlogView(id);        // call once per visitor page-load
 *   await api.deleteBlogPost(id);
 */

class SmeatonAPI {
  constructor() {
    this.baseUrl = process.env.SMEATON_BASE_URL;
    this.apiKey  = process.env.SMEATON_API_KEY;

    if (!this.baseUrl) throw new Error('Missing SMEATON_BASE_URL in environment secrets.');
    if (!this.apiKey)  throw new Error('Missing SMEATON_API_KEY in environment secrets.');
  }

  // ─── Internal request helper ───────────────────────────────────────────────
  async #request(method, path, body = null) {
    const url = `${this.baseUrl}${path}`;
    const options = {
      method,
      headers: {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    };
    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }
    const res = await fetch(url, options);
    const json = await res.json();
    if (!res.ok || !json.success) {
      const msg = json.message || json.error || `HTTP ${res.status}`;
      throw new Error(`[SmeatonAPI] ${method} ${path} — ${msg}`);
    }
    return json;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // HEALTH
  // ══════════════════════════════════════════════════════════════════════════

  /** Confirm the API is reachable. Returns { service, version, timestamp }. */
  async health() {
    return this.#request('GET', '/health');
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ENQUIRIES
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * List enquiries submitted via the Smeaton contact form.
   * @param {{ status?: 'new'|'contacted'|'quoted'|'closed', type?: 'care-request'|'staff-booking' }} filters
   */
  async getEnquiries(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.type)   params.set('type',   filters.type);
    const qs = params.toString() ? `?${params}` : '';
    return this.#request('GET', `/enquiries${qs}`);
  }

  /** Get a single enquiry by ID. */
  async getEnquiry(id) {
    return this.#request('GET', `/enquiries/${id}`);
  }

  /**
   * Update an enquiry's status.
   * @param {string} id
   * @param {{ status: 'new'|'contacted'|'quoted'|'closed' }} updates
   */
  async updateEnquiry(id, updates) {
    return this.#request('PATCH', `/enquiries/${id}`, updates);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // JOBS
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * List job listings.
   * @param {{ isActive?: boolean, location?: string, type?: 'permanent'|'care-at-home'|'temporary' }} filters
   */
  async getJobs(filters = {}) {
    const params = new URLSearchParams();
    if (filters.isActive !== undefined) params.set('isActive', String(filters.isActive));
    if (filters.location)               params.set('location', filters.location);
    if (filters.type)                   params.set('type',     filters.type);
    const qs = params.toString() ? `?${params}` : '';
    return this.#request('GET', `/jobs${qs}`);
  }

  /** Get a single job by ID. */
  async getJob(id) {
    return this.#request('GET', `/jobs/${id}`);
  }

  /**
   * Create a new job listing on the Smeaton website.
   *
   * Required: title, type ('permanent'|'care-at-home'|'temporary'),
   *           location, salaryType ('hourly'|'weekly'|'annual'),
   *           salaryMin (number), summary, description
   *
   * Optional: salaryMax, department, requirements, benefits, reportsTo,
   *           experienceLevel ('entry'|'1-2-years'|'3-5-years'|'5-plus-years'),
   *           isActive (boolean, defaults true)
   */
  async createJob(jobData) {
    return this.#request('POST', '/jobs', jobData);
  }

  /** Update an existing job — only send the fields you want to change. */
  async updateJob(id, updates) {
    return this.#request('PATCH', `/jobs/${id}`, updates);
  }

  /** Permanently delete a job listing. */
  async deleteJob(id) {
    return this.#request('DELETE', `/jobs/${id}`);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // APPLICATIONS
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * List job applications.
   * @param {{ jobId?: string, status?: 'pending'|'reviewed'|'interview'|'hired'|'rejected' }} filters
   */
  async getApplications(filters = {}) {
    const params = new URLSearchParams();
    if (filters.jobId)  params.set('jobId',  filters.jobId);
    if (filters.status) params.set('status', filters.status);
    const qs = params.toString() ? `?${params}` : '';
    return this.#request('GET', `/applications${qs}`);
  }

  /** Get a single application by ID. */
  async getApplication(id) {
    return this.#request('GET', `/applications/${id}`);
  }

  /**
   * Update an application's status and/or admin notes.
   * @param {string} id
   * @param {{ status?: 'pending'|'reviewed'|'interview'|'hired'|'rejected', notes?: string }} updates
   */
  async updateApplication(id, updates) {
    return this.#request('PATCH', `/applications/${id}`, updates);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // BLOG CATEGORIES
  // ══════════════════════════════════════════════════════════════════════════

  /** List all blog categories. */
  async getBlogCategories() {
    return this.#request('GET', '/blog/categories');
  }

  /**
   * Create a new blog category.
   * @param {{ name: string, description?: string, isActive?: boolean }} data
   */
  async createBlogCategory(data) {
    return this.#request('POST', '/blog/categories', data);
  }

  /** Update a blog category — only send the fields you want to change. */
  async updateBlogCategory(id, updates) {
    return this.#request('PATCH', `/blog/categories/${id}`, updates);
  }

  /**
   * Delete a blog category.
   * Will fail if any blog posts are still assigned to it.
   */
  async deleteBlogCategory(id) {
    return this.#request('DELETE', `/blog/categories/${id}`);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // BLOG POSTS
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * List blog posts.
   * Response includes: { total, published, drafts, totalViews, data: [...] }
   * @param {{ isPublished?: boolean, categoryId?: string }} filters
   */
  async getBlogPosts(filters = {}) {
    const params = new URLSearchParams();
    if (filters.isPublished !== undefined) params.set('isPublished', String(filters.isPublished));
    if (filters.categoryId)               params.set('categoryId',  filters.categoryId);
    const qs = params.toString() ? `?${params}` : '';
    return this.#request('GET', `/blog/posts${qs}`);
  }

  /** Get a single blog post by its ID. */
  async getBlogPost(id) {
    return this.#request('GET', `/blog/posts/${id}`);
  }

  /** Get a single blog post by its URL slug (e.g. 'our-care-team-2025'). */
  async getBlogPostBySlug(slug) {
    return this.#request('GET', `/blog/posts/slug/${slug}`);
  }

  /**
   * Create a new blog post (saved as a draft — not visible on the site until published).
   *
   * Required: title, slug (URL-friendly, e.g. 'my-post-title'),
   *           categoryId, author
   *
   * Optional: excerpt, content, blocks (structured content array),
   *           imagePath, readTime (e.g. '5 min read'), isActive
   *
   * To make the post live immediately, call publishBlogPost(id) after creating it.
   */
  async createBlogPost(postData) {
    return this.#request('POST', '/blog/posts', postData);
  }

  /** Update any fields on a blog post — only send the fields you want to change. */
  async updateBlogPost(id, updates) {
    return this.#request('PATCH', `/blog/posts/${id}`, updates);
  }

  /**
   * Publish a blog post — makes it visible on the Smeaton website immediately.
   * Sets isPublished = true and records the publishedAt timestamp.
   */
  async publishBlogPost(id) {
    return this.#request('POST', `/blog/posts/${id}/publish`);
  }

  /**
   * Unpublish a blog post — hides it from the website (reverts to draft).
   * The post and all its content are kept, just not visible publicly.
   */
  async unpublishBlogPost(id) {
    return this.#request('POST', `/blog/posts/${id}/unpublish`);
  }

  /**
   * Record a page view for a blog post.
   * Call this once each time a visitor loads the blog post page.
   * Returns { success: true, viewCount: N }.
   */
  async recordBlogView(id) {
    return this.#request('POST', `/blog/posts/${id}/view`);
  }

  /** Permanently delete a blog post. */
  async deleteBlogPost(id) {
    return this.#request('DELETE', `/blog/posts/${id}`);
  }
}

module.exports = { SmeatonAPI };


// ─── Quick test — run `node smeaton-api.js` to verify connection ───────────
if (require.main === module) {
  (async () => {
    try {
      const api = new SmeatonAPI();

      const health = await api.health();
      console.log('✅ Connected:', health.service);

      const enquiries = await api.getEnquiries();
      console.log(`📬 Enquiries: ${enquiries.total} total`);

      const jobs = await api.getJobs({ isActive: true });
      console.log(`💼 Active jobs: ${jobs.total} total`);

      const applications = await api.getApplications();
      console.log(`📋 Applications: ${applications.total} total`);

      const categories = await api.getBlogCategories();
      console.log(`🗂  Blog categories: ${categories.total} total`);

      const posts = await api.getBlogPosts();
      console.log(`📝 Blog posts: ${posts.total} total | ${posts.published} published | ${posts.drafts} drafts | 👁 ${posts.totalViews} total views`);

    } catch (err) {
      console.error('❌ Failed:', err.message);
    }
  })();
}
