/**
 * Smeaton Healthcare API Client
 * ─────────────────────────────
 * Drop this file into your CareLogr Replit project.
 *
 * Setup (in CareLogr Replit Secrets):
 *   SMEATON_API_KEY  = clgr_e17439bf4d355423d437d047611f10e8124c5a9f15ac55aa7690da8df011a14a
 *   SMEATON_BASE_URL = https://ff2b305e-a39b-4452-8770-c986e5e4bcf4-00-164v8ay1wakf2.janeway.replit.dev/api/carelogr
 *
 * NOTE: Once the Smeaton site is published, replace SMEATON_BASE_URL with the live .replit.app URL.
 *
 * Usage examples:
 *   const api = new SmeatonAPI();
 *
 *   const enquiries = await api.getEnquiries({ status: 'new' });
 *   await api.updateEnquiry(id, { status: 'contacted' });
 *
 *   const jobs = await api.getJobs({ isActive: true });
 *   const job  = await api.createJob({ title: 'Care Assistant', ... });
 *   await api.updateJob(id, { isActive: false });
 *   await api.deleteJob(id);
 *
 *   const apps = await api.getApplications({ status: 'pending' });
 *   await api.updateApplication(id, { status: 'interview', notes: 'Called Monday' });
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

  /**
   * Check the API is reachable and get version info.
   * @returns {{ service, version, timestamp, resources }}
   */
  async health() {
    return this.#request('GET', '/health');
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ENQUIRIES
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Get all enquiries submitted via the Smeaton website contact form.
   *
   * @param {{ status?: 'new'|'contacted'|'quoted'|'closed', type?: 'care-request'|'staff-booking' }} filters
   * @returns {Promise<{ total: number, data: Enquiry[] }>}
   */
  async getEnquiries(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.type)   params.set('type',   filters.type);
    const qs = params.toString() ? `?${params}` : '';
    return this.#request('GET', `/enquiries${qs}`);
  }

  /**
   * Get a single enquiry by ID.
   * @param {string} id
   * @returns {Promise<{ data: Enquiry }>}
   */
  async getEnquiry(id) {
    return this.#request('GET', `/enquiries/${id}`);
  }

  /**
   * Update an enquiry's status.
   * @param {string} id
   * @param {{ status: 'new'|'contacted'|'quoted'|'closed' }} updates
   * @returns {Promise<{ data: Enquiry }>}
   */
  async updateEnquiry(id, updates) {
    return this.#request('PATCH', `/enquiries/${id}`, updates);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // JOBS
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Get all job listings.
   *
   * @param {{ isActive?: boolean, location?: string, type?: 'permanent'|'care-at-home'|'temporary' }} filters
   * @returns {Promise<{ total: number, data: Job[] }>}
   */
  async getJobs(filters = {}) {
    const params = new URLSearchParams();
    if (filters.isActive  !== undefined) params.set('isActive',  String(filters.isActive));
    if (filters.location)                params.set('location',  filters.location);
    if (filters.type)                    params.set('type',      filters.type);
    const qs = params.toString() ? `?${params}` : '';
    return this.#request('GET', `/jobs${qs}`);
  }

  /**
   * Get a single job by ID.
   * @param {string} id
   * @returns {Promise<{ data: Job }>}
   */
  async getJob(id) {
    return this.#request('GET', `/jobs/${id}`);
  }

  /**
   * Create a new job listing on the Smeaton website.
   *
   * Required fields:
   *   title (string)
   *   type  ('permanent' | 'care-at-home' | 'temporary')
   *   location (string)
   *   salaryType ('hourly' | 'weekly' | 'annual')
   *   salaryMin (number)
   *   summary (string)
   *   description (string)
   *
   * Optional fields:
   *   salaryMax, department, requirements, benefits,
   *   reportsTo, experienceLevel ('entry'|'1-2-years'|'3-5-years'|'5-plus-years'),
   *   isActive (boolean, defaults true)
   *
   * @param {Partial<Job>} jobData
   * @returns {Promise<{ data: Job }>}
   */
  async createJob(jobData) {
    return this.#request('POST', '/jobs', jobData);
  }

  /**
   * Update an existing job. Only send the fields you want to change.
   * @param {string} id
   * @param {Partial<Job>} updates
   * @returns {Promise<{ data: Job }>}
   */
  async updateJob(id, updates) {
    return this.#request('PATCH', `/jobs/${id}`, updates);
  }

  /**
   * Delete a job listing permanently.
   * @param {string} id
   * @returns {Promise<{ message: string }>}
   */
  async deleteJob(id) {
    return this.#request('DELETE', `/jobs/${id}`);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // APPLICATIONS
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Get all applications.
   *
   * @param {{ jobId?: string, status?: 'pending'|'reviewed'|'interview'|'hired'|'rejected' }} filters
   * @returns {Promise<{ total: number, data: Application[] }>}
   */
  async getApplications(filters = {}) {
    const params = new URLSearchParams();
    if (filters.jobId)  params.set('jobId',  filters.jobId);
    if (filters.status) params.set('status', filters.status);
    const qs = params.toString() ? `?${params}` : '';
    return this.#request('GET', `/applications${qs}`);
  }

  /**
   * Get a single application by ID.
   * @param {string} id
   * @returns {Promise<{ data: Application }>}
   */
  async getApplication(id) {
    return this.#request('GET', `/applications/${id}`);
  }

  /**
   * Update an application's status and/or admin notes.
   *
   * @param {string} id
   * @param {{ status?: 'pending'|'reviewed'|'interview'|'hired'|'rejected', notes?: string }} updates
   * @returns {Promise<{ data: Application }>}
   */
  async updateApplication(id, updates) {
    return this.#request('PATCH', `/applications/${id}`, updates);
  }
}

module.exports = { SmeatonAPI };


// ─────────────────────────────────────────────────────────────────────────────
// QUICK TEST  —  run `node smeaton-api.js` to verify the connection
// ─────────────────────────────────────────────────────────────────────────────
if (require.main === module) {
  (async () => {
    try {
      const api = new SmeatonAPI();

      const health = await api.health();
      console.log('✅ Connected to', health.service, 'v' + health.data?.version || '');

      const enquiries = await api.getEnquiries();
      console.log(`📬 Enquiries: ${enquiries.total} total`);

      const jobs = await api.getJobs({ isActive: true });
      console.log(`💼 Active jobs: ${jobs.total} total`);

      const applications = await api.getApplications();
      console.log(`📋 Applications: ${applications.total} total`);

    } catch (err) {
      console.error('❌ Connection failed:', err.message);
    }
  })();
}
