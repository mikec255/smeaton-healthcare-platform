import { TransactionalEmailsApi, TransactionalEmailsApiApiKeys } from '@getbrevo/brevo';

class BrevoService {
  private emailApi: TransactionalEmailsApi;
  private isConfigured = false;

  constructor() {
    this.emailApi = new TransactionalEmailsApi();
    this.configure();
  }

  private configure() {
    // Try multiple environment variable names as fallback
    const apiKey = process.env.BREVO_API_KEY_OVERRIDE || 
                   process.env.BREVO_API_KEY || 
                   process.env.SENDINBLUE_API_KEY || 
                   process.env.BREVO_KEY;
    
    if (apiKey && this.isValidApiKey(apiKey)) {
      this.emailApi.setApiKey(TransactionalEmailsApiApiKeys.apiKey, apiKey.trim());
      this.isConfigured = true;
      console.log('Brevo service configured successfully from environment');
    } else {
      console.warn('Valid Brevo API key not found in environment variables');
    }
  }

  private isValidApiKey(apiKey: string): boolean {
    const trimmed = apiKey.trim();
    return trimmed.length > 50 && /^x(keys|smtps)ib-/.test(trimmed);
  }

  // SECURITY: Runtime API key configuration removed - environment variables only

  // Check if email service is properly configured
  isEmailConfigured(): boolean {
    return this.isConfigured;
  }

  // Method to reconfigure with fresh environment variables
  reconfigure() {
    this.configure();
  }

  async sendWelcomeEmail(email: string, username: string, password: string, role: string) {
    if (!this.isConfigured) {
      console.warn('Brevo not configured - skipping email send');
      return;
    }

    try {
      const result = await this.emailApi.sendTransacEmail({
        to: [{
          email: email,
          name: username
        }],
        subject: 'Welcome to Smeaton Healthcare Admin Portal',
        htmlContent: this.getWelcomeEmailHtml(username, email, password, role),
        textContent: this.getWelcomeEmailText(username, email, password, role),
        sender: {
          email: 'recruitment@smeatonhealthcare.co.uk',
          name: 'Smeaton Healthcare'
        }
      });

      console.log('Welcome email sent successfully:', result.body?.messageId || 'Email sent');
      return result;
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      throw error;
    }
  }

  async sendPasswordCreationEmail(email: string, username: string, token: string, role: string) {
    if (!this.isConfigured) {
      console.warn('Brevo not configured - skipping email send');
      return;
    }

    try {
      const result = await this.emailApi.sendTransacEmail({
        to: [{
          email: email,
          name: username
        }],
        subject: 'Set up your Smeaton Healthcare Admin Account',
        htmlContent: this.getPasswordCreationEmailHtml(username, email, token, role),
        textContent: this.getPasswordCreationEmailText(username, email, token, role),
        sender: {
          email: 'recruitment@smeatonhealthcare.co.uk',
          name: 'Smeaton Healthcare'
        }
      });

      console.log('Password creation email sent successfully:', result.body?.messageId || 'Email sent');
      return result;
    } catch (error) {
      console.error('Failed to send password creation email:', error);
      throw error;
    }
  }

  async sendContactFormEmail(contactData: {
    name: string;
    email: string;
    phone: string;
    reason: string;
    message: string;
  }) {
    if (!this.isConfigured) {
      console.warn('Brevo not configured - skipping contact form email send');
      return;
    }

    try {
      const result = await this.emailApi.sendTransacEmail({
        to: [{
          email: 'hello@smeatonhealthcare.co.uk',
          name: 'Smeaton Healthcare'
        }],
        subject: `New Contact Form Submission: ${contactData.reason}`,
        htmlContent: this.getContactFormEmailHtml(contactData),
        textContent: this.getContactFormEmailText(contactData),
        sender: {
          email: 'recruitment@smeatonhealthcare.co.uk',
          name: 'Smeaton Healthcare'
        },
        replyTo: {
          email: contactData.email,
          name: contactData.name
        }
      });

      console.log('Contact form email sent successfully:', result.body?.messageId || 'Email sent');
      return result;
    } catch (error) {
      console.error('Failed to send contact form email:', error);
      throw error;
    }
  }

  async sendReferralEmail(referralData: any) {
    if (!this.isConfigured) {
      console.warn('Brevo not configured - skipping referral email send');
      return;
    }

    try {
      const result = await this.emailApi.sendTransacEmail({
        to: [{
          email: 'hello@smeatonhealthcare.co.uk',
          name: 'Smeaton Healthcare Team'
        }],
        subject: `New Care Referral - ${referralData.clientName}`,
        htmlContent: this.getReferralEmailHtml(referralData),
        textContent: this.getReferralEmailText(referralData),
        sender: {
          email: 'recruitment@smeatonhealthcare.co.uk',
          name: 'Smeaton Healthcare'
        }
      });

      console.log('Referral email sent successfully:', result.body?.messageId || 'Email sent');
      return result;
    } catch (error) {
      console.error('Failed to send referral email:', error);
      throw error;
    }
  }

  async sendPreScreenApplicationEmail(applicationData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    location: string;
    jobTitle: string;
    branch: string;
    experience?: string;
    currentlyWorking?: boolean;
    currentEmployer?: string;
    referralSource?: string;
    shiftPreferences?: string[];
    hasDBS?: boolean;
    hasMHCertificate?: boolean;
    additionalInfo?: string;
  }) {
    if (!this.isConfigured) {
      console.warn('Brevo not configured - skipping pre-screen application email send');
      return;
    }

    try {
      const applicantName = `${applicationData.firstName} ${applicationData.lastName}`;
      const subject = `${applicationData.branch} Branch - ${applicantName}`;

      const result = await this.emailApi.sendTransacEmail({
        to: [{
          email: 'recruitment@smeatonhealthcare.co.uk',
          name: 'Smeaton Healthcare Recruitment'
        }],
        subject: subject,
        htmlContent: this.getPreScreenApplicationEmailHtml(applicationData),
        textContent: this.getPreScreenApplicationEmailText(applicationData),
        sender: {
          email: 'recruitment@smeatonhealthcare.co.uk',
          name: 'Smeaton Healthcare'
        }
      });

      console.log('Pre-screen application email sent successfully:', result.body?.messageId || 'Email sent');
      return result;
    } catch (error) {
      console.error('Failed to send pre-screen application email:', error);
      throw error;
    }
  }

  private getWelcomeEmailHtml(username: string, email: string, password: string, role: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to Smeaton Healthcare</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #EF2587; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .credentials { background-color: white; padding: 15px; border-left: 4px solid #275799; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          .button { display: inline-block; background-color: #275799; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Smeaton Healthcare</h1>
            <p>Admin Portal Access</p>
          </div>
          
          <div class="content">
            <h2>Hello ${username}!</h2>
            
            <p>Welcome to the Smeaton Healthcare admin portal! Your account has been created with <strong>${role}</strong> privileges.</p>
            
            <div class="credentials">
              <h3>Your Login Details:</h3>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Password:</strong> ${password}</p>
              <p><strong>Role:</strong> ${role}</p>
            </div>
            
            <p>You can access the admin portal at:</p>
            <a href="https://www.smeatonhealthcare.co.uk/admin" class="button">
              Access Admin Portal
            </a>
            
            <p><strong>Important Security Notes:</strong></p>
            <ul>
              <li>Please change your password after your first login</li>
              <li>Keep your login credentials secure and confidential</li>
              <li>Never share your account details with unauthorized personnel</li>
            </ul>
            
            <p>If you have any questions or need assistance, please contact the system administrator.</p>
          </div>
          
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Smeaton Healthcare. All rights reserved.</p>
            <p>Healthcare staffing solutions across Devon and Cornwall</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getWelcomeEmailText(username: string, email: string, password: string, role: string): string {
    return `
Welcome to Smeaton Healthcare Admin Portal!

Hello ${username},

Your account has been created with ${role} privileges.

Your Login Details:
- Email: ${email}
- Password: ${password}
- Role: ${role}

You can access the admin portal at: https://www.smeatonhealthcare.co.uk/admin

Important Security Notes:
- Please change your password after your first login
- Keep your login credentials secure and confidential
- Never share your account details with unauthorized personnel

If you have any questions or need assistance, please contact the system administrator.

© ${new Date().getFullYear()} Smeaton Healthcare. All rights reserved.
Healthcare staffing solutions across Devon and Cornwall
    `;
  }

  private getPasswordCreationEmailHtml(username: string, email: string, token: string, role: string): string {
    const passwordCreationUrl = `https://www.smeatonhealthcare.co.uk/create-password?token=${encodeURIComponent(token)}`;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Set up your Smeaton Healthcare Account</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #EF2587; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .account-info { background-color: white; padding: 15px; border-left: 4px solid #275799; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          .button { display: inline-block; background-color: #275799; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 15px 0; }
          .warning { background-color: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 12px; border-radius: 4px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Smeaton Healthcare</h1>
            <p>Complete Your Account Setup</p>
          </div>
          
          <div class="content">
            <h2>Hello ${username}!</h2>
            
            <p>Your admin account has been created with <strong>${role}</strong> privileges. To complete your account setup, please create your password using the secure link below.</p>
            
            <div class="account-info">
              <h3>Your Account Details:</h3>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Role:</strong> ${role}</p>
            </div>
            
            <p>Click the button below to create your password:</p>
            <a href="${passwordCreationUrl}" class="button">
              Create Your Password
            </a>
            
            <div class="warning">
              <p><strong>Important:</strong> This link will expire in 24 hours for security reasons. If the link expires, please contact your administrator to generate a new one.</p>
            </div>
            
            <p><strong>Security Notes:</strong></p>
            <ul>
              <li>Choose a strong, unique password for your account</li>
              <li>Keep your login credentials secure and confidential</li>
              <li>Never share your account details with unauthorized personnel</li>
            </ul>
            
            <p>If you have any questions or need assistance, please contact the system administrator.</p>
          </div>
          
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Smeaton Healthcare. All rights reserved.</p>
            <p>Healthcare staffing solutions across Devon and Cornwall</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getPasswordCreationEmailText(username: string, email: string, token: string, role: string): string {
    const passwordCreationUrl = `https://www.smeatonhealthcare.co.uk/create-password?token=${encodeURIComponent(token)}`;
    
    return `
Welcome to Smeaton Healthcare Admin Portal!

Hello ${username},

Your admin account has been created with ${role} privileges. To complete your account setup, please create your password using the secure link below.

Your Account Details:
- Email: ${email}
- Role: ${role}

Create your password here: ${passwordCreationUrl}

IMPORTANT: This link will expire in 24 hours for security reasons. If the link expires, please contact your administrator to generate a new one.

Security Notes:
- Choose a strong, unique password for your account
- Keep your login credentials secure and confidential
- Never share your account details with unauthorized personnel

If you have any questions or need assistance, please contact the system administrator.

© ${new Date().getFullYear()} Smeaton Healthcare. All rights reserved.
Healthcare staffing solutions across Devon and Cornwall
    `;
  }

  private getContactFormEmailHtml(contactData: {
    name: string;
    email: string;
    phone: string;
    reason: string;
    message: string;
  }): string {
    const timestamp = new Date().toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/London'
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Contact Form Submission</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #EF2587; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .contact-details { background-color: white; padding: 15px; border-left: 4px solid #275799; margin: 20px 0; }
          .message-content { background-color: white; padding: 15px; border-left: 4px solid #EF2587; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          .timestamp { color: #666; font-size: 14px; text-align: right; margin-bottom: 10px; }
          .field { margin-bottom: 12px; }
          .field-label { font-weight: bold; color: #275799; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Website Contact Form</h1>
            <p>Smeaton Healthcare Website</p>
          </div>
          
          <div class="content">
            <div class="timestamp">Received: ${timestamp}</div>
            
            <h2>Contact Details</h2>
            <div class="contact-details">
              <div class="field">
                <span class="field-label">Name:</span> ${contactData.name}
              </div>
              <div class="field">
                <span class="field-label">Email:</span> ${contactData.email}
              </div>
              <div class="field">
                <span class="field-label">Phone:</span> ${contactData.phone}
              </div>
              <div class="field">
                <span class="field-label">Reason for Contact:</span> ${contactData.reason}
              </div>
            </div>
            
            <h3>Message</h3>
            <div class="message-content">
              <p>${contactData.message.replace(/\n/g, '<br>')}</p>
            </div>
            
            <p><strong>Note:</strong> This enquiry was submitted through the contact form on the Smeaton Healthcare website. Please respond to ${contactData.email} or call ${contactData.phone}.</p>
          </div>
          
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Smeaton Healthcare. All rights reserved.</p>
            <p>Healthcare staffing solutions across Devon and Cornwall</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getContactFormEmailText(contactData: {
    name: string;
    email: string;
    phone: string;
    reason: string;
    message: string;
  }): string {
    const timestamp = new Date().toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/London'
    });

    return `
New Contact Form Submission - Smeaton Healthcare Website
Received: ${timestamp}

===== CONTACT DETAILS =====
Name: ${contactData.name}
Email: ${contactData.email}
Phone: ${contactData.phone}
Reason for Contact: ${contactData.reason}

===== MESSAGE =====
${contactData.message}

===== ACTION REQUIRED =====
Please respond to this enquiry by:
- Email: ${contactData.email}
- Phone: ${contactData.phone}

This enquiry was submitted through the contact form on the Smeaton Healthcare website.

© ${new Date().getFullYear()} Smeaton Healthcare. All rights reserved.
Healthcare staffing solutions across Devon and Cornwall
    `;
  }

  private getReferralEmailHtml(referralData: any): string {
    const timestamp = new Date().toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/London'
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Care Referral</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #EF2587; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .info-section { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #275799; }
          .urgent { border-left-color: #ff6b6b; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          .highlight { background-color: #fff3cd; padding: 10px; border-radius: 5px; margin: 10px 0; }
          h3 { color: #275799; margin-top: 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🩺 New Care Referral</h1>
            <p>Received: ${timestamp}</p>
          </div>
          
          <div class="content">
            <div class="highlight">
              <h2>Care Referral for: ${referralData.clientName}</h2>
              <p><strong>Urgency Level:</strong> ${referralData.urgency}</p>
            </div>

            <div class="info-section">
              <h3>👤 Referrer Information</h3>
              <p><strong>Name:</strong> ${referralData.referrerName}</p>
              <p><strong>Email:</strong> ${referralData.referrerEmail}</p>
              <p><strong>Phone:</strong> ${referralData.referrerPhone}</p>
              <p><strong>Relationship to Client:</strong> ${referralData.relationship}</p>
            </div>

            <div class="info-section">
              <h3>🏠 Client Information</h3>
              <p><strong>Name:</strong> ${referralData.clientName}</p>
              <p><strong>Age:</strong> ${referralData.clientAge}</p>
              <p><strong>Address:</strong> ${referralData.clientAddress}</p>
              ${referralData.clientPhone ? `<p><strong>Phone:</strong> ${referralData.clientPhone}</p>` : ''}
            </div>

            <div class="info-section">
              <h3>💊 Care Requirements</h3>
              <p><strong>Service Type:</strong> ${referralData.serviceType}</p>
              ${referralData.startDate ? `<p><strong>Preferred Start Date:</strong> ${referralData.startDate}</p>` : ''}
              ${referralData.currentSupport ? `<p><strong>Current Support:</strong> ${referralData.currentSupport}</p>` : ''}
              ${referralData.medicalConditions ? `<p><strong>Medical Conditions:</strong> ${referralData.medicalConditions}</p>` : ''}
              ${referralData.mobilityRequirements ? `<p><strong>Mobility Requirements:</strong> ${referralData.mobilityRequirements}</p>` : ''}
              ${referralData.communicationNeeds ? `<p><strong>Communication Needs:</strong> ${referralData.communicationNeeds}</p>` : ''}
              ${referralData.behavioralSupport ? `<p><strong>Behavioral Support:</strong> ${referralData.behavioralSupport}</p>` : ''}
            </div>

            ${referralData.additionalInfo ? `
            <div class="info-section">
              <h3>📝 Additional Information</h3>
              <p>${referralData.additionalInfo.replace(/\n/g, '<br>')}</p>
            </div>
            ` : ''}

            <div class="highlight">
              <h3>📞 Next Steps</h3>
              <p>Please contact the referrer within 2 hours to arrange an assessment.</p>
              <p><strong>Primary Contact:</strong> ${referralData.referrerEmail} or ${referralData.referrerPhone}</p>
            </div>
          </div>
          
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Smeaton Healthcare. All rights reserved.</p>
            <p>Healthcare staffing solutions across Devon and Cornwall</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getReferralEmailText(referralData: any): string {
    const timestamp = new Date().toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/London'
    });

    return `
New Care Referral - Smeaton Healthcare Website
Received: ${timestamp}

===== CARE REFERRAL FOR: ${referralData.clientName} =====
Urgency Level: ${referralData.urgency}

===== REFERRER INFORMATION =====
Name: ${referralData.referrerName}
Email: ${referralData.referrerEmail}
Phone: ${referralData.referrerPhone}
Relationship to Client: ${referralData.relationship}

===== CLIENT INFORMATION =====
Name: ${referralData.clientName}
Age: ${referralData.clientAge}
Address: ${referralData.clientAddress}
${referralData.clientPhone ? `Phone: ${referralData.clientPhone}` : ''}

===== CARE REQUIREMENTS =====
Service Type: ${referralData.serviceType}
${referralData.startDate ? `Preferred Start Date: ${referralData.startDate}` : ''}
${referralData.currentSupport ? `Current Support: ${referralData.currentSupport}` : ''}
${referralData.medicalConditions ? `Medical Conditions: ${referralData.medicalConditions}` : ''}
${referralData.mobilityRequirements ? `Mobility Requirements: ${referralData.mobilityRequirements}` : ''}
${referralData.communicationNeeds ? `Communication Needs: ${referralData.communicationNeeds}` : ''}
${referralData.behavioralSupport ? `Behavioral Support: ${referralData.behavioralSupport}` : ''}

${referralData.additionalInfo ? `===== ADDITIONAL INFORMATION =====
${referralData.additionalInfo}

` : ''}===== ACTION REQUIRED =====
Please contact the referrer within 2 hours to arrange an assessment.
Primary Contact: ${referralData.referrerEmail} or ${referralData.referrerPhone}

This referral was submitted through the Smeaton Healthcare website.

© ${new Date().getFullYear()} Smeaton Healthcare. All rights reserved.
Healthcare staffing solutions across Devon and Cornwall
    `;
  }

  private getPreScreenApplicationEmailHtml(applicationData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    location: string;
    jobTitle: string;
    branch: string;
    experience?: string;
    currentlyWorking?: boolean;
    currentEmployer?: string;
    referralSource?: string;
    shiftPreferences?: string[];
    hasDBS?: boolean;
    hasMHCertificate?: boolean;
    additionalInfo?: string;
  }): string {
    const timestamp = new Date().toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/London'
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Job Application</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #EF2587; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .info-section { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #275799; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          .highlight { background-color: #fff3cd; padding: 10px; border-radius: 5px; margin: 10px 0; }
          h3 { color: #275799; margin-top: 0; }
          .badge { display: inline-block; background-color: #275799; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; margin: 2px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💼 New Job Application</h1>
            <p>Received: ${timestamp}</p>
          </div>
          
          <div class="content">
            <div class="highlight">
              <h2>Application for: ${applicationData.jobTitle}</h2>
              <p><strong>Branch:</strong> ${applicationData.branch}</p>
              <p><strong>Applicant:</strong> ${applicationData.firstName} ${applicationData.lastName}</p>
            </div>

            <div class="info-section">
              <h3>👤 Contact Information</h3>
              <p><strong>Name:</strong> ${applicationData.firstName} ${applicationData.lastName}</p>
              <p><strong>Email:</strong> ${applicationData.email}</p>
              <p><strong>Phone:</strong> ${applicationData.phone}</p>
              <p><strong>Location:</strong> ${applicationData.location}</p>
            </div>

            <div class="info-section">
              <h3>💼 Employment Details</h3>
              ${applicationData.currentlyWorking !== undefined ? `<p><strong>Currently Working:</strong> ${applicationData.currentlyWorking ? 'Yes' : 'No'}</p>` : ''}
              ${applicationData.currentEmployer ? `<p><strong>Current Employer:</strong> ${applicationData.currentEmployer}</p>` : ''}
              ${applicationData.experience ? `<p><strong>Experience:</strong> ${applicationData.experience}</p>` : ''}
              ${applicationData.referralSource ? `<p><strong>How they heard about us:</strong> ${applicationData.referralSource}</p>` : ''}
            </div>

            ${applicationData.shiftPreferences && applicationData.shiftPreferences.length > 0 ? `
            <div class="info-section">
              <h3>⏰ Shift Preferences</h3>
              <p>${applicationData.shiftPreferences.map(pref => `<span class="badge">${pref}</span>`).join('')}</p>
            </div>
            ` : ''}

            <div class="info-section">
              <h3>📋 Certifications</h3>
              <p><strong>DBS Check:</strong> ${applicationData.hasDBS === true ? 'Yes' : applicationData.hasDBS === false ? 'No' : 'Not specified'}</p>
              <p><strong>Mental Health Certificate:</strong> ${applicationData.hasMHCertificate === true ? 'Yes' : applicationData.hasMHCertificate === false ? 'No' : 'Not specified'}</p>
            </div>

            ${applicationData.additionalInfo ? `
            <div class="info-section">
              <h3>📝 Additional Information</h3>
              <p>${applicationData.additionalInfo}</p>
            </div>
            ` : ''}

            <div class="info-section">
              <h3>⚡ Next Steps</h3>
              <p>Please review this application and contact the candidate within 24 hours.</p>
              <p><strong>Primary Contact:</strong> ${applicationData.email} or ${applicationData.phone}</p>
            </div>
          </div>
          
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Smeaton Healthcare. All rights reserved.</p>
            <p>Healthcare staffing solutions across Devon and Cornwall</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getPreScreenApplicationEmailText(applicationData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    location: string;
    jobTitle: string;
    branch: string;
    experience?: string;
    currentlyWorking?: boolean;
    currentEmployer?: string;
    referralSource?: string;
    shiftPreferences?: string[];
    hasDBS?: boolean;
    hasMHCertificate?: boolean;
    additionalInfo?: string;
  }): string {
    const timestamp = new Date().toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/London'
    });

    return `
New Job Application - Smeaton Healthcare
Received: ${timestamp}

===== APPLICATION FOR: ${applicationData.jobTitle} =====
Branch: ${applicationData.branch}
Applicant: ${applicationData.firstName} ${applicationData.lastName}

===== CONTACT INFORMATION =====
Name: ${applicationData.firstName} ${applicationData.lastName}
Email: ${applicationData.email}
Phone: ${applicationData.phone}
Location: ${applicationData.location}

===== EMPLOYMENT DETAILS =====
${applicationData.currentlyWorking !== undefined ? `Currently Working: ${applicationData.currentlyWorking ? 'Yes' : 'No'}` : ''}
${applicationData.currentEmployer ? `Current Employer: ${applicationData.currentEmployer}` : ''}
${applicationData.experience ? `Experience: ${applicationData.experience}` : ''}
${applicationData.referralSource ? `How they heard about us: ${applicationData.referralSource}` : ''}

${applicationData.shiftPreferences && applicationData.shiftPreferences.length > 0 ? `===== SHIFT PREFERENCES =====
${applicationData.shiftPreferences.join(', ')}

` : ''}===== CERTIFICATIONS =====
DBS Check: ${applicationData.hasDBS === true ? 'Yes' : applicationData.hasDBS === false ? 'No' : 'Not specified'}
Mental Health Certificate: ${applicationData.hasMHCertificate === true ? 'Yes' : applicationData.hasMHCertificate === false ? 'No' : 'Not specified'}

${applicationData.additionalInfo ? `===== ADDITIONAL INFORMATION =====
${applicationData.additionalInfo}

` : ''}===== NEXT STEPS =====
Please review this application and contact the candidate within 24 hours.
Primary Contact: ${applicationData.email} or ${applicationData.phone}

This application was submitted through the Smeaton Healthcare website.

© ${new Date().getFullYear()} Smeaton Healthcare. All rights reserved.
Healthcare staffing solutions across Devon and Cornwall
    `;
  }

  async sendAuditReviewReminderEmail(auditData: {
    auditTitle: string;
    auditType: string;
    serviceType: string;
    completedDate: string;
    nextReviewDate: string;
    daysUntilDue: number;
    auditorName: string;
    overallRating?: string;
    areasForImprovement?: string;
  }) {
    if (!this.isConfigured) {
      console.warn('Brevo not configured - skipping audit reminder email send');
      return;
    }

    try {
      const result = await this.emailApi.sendTransacEmail({
        to: [{
          email: 'michael@smeatonhealthcare.co.uk',
          name: 'Michael Smeaton'
        }],
        sender: {
          email: 'noreply@brevosend.com',
          name: 'Smeaton Healthcare CQC System'
        },
        subject: `CQC Audit Review Due in ${auditData.daysUntilDue} days - ${auditData.auditTitle}`,
        htmlContent: this.getAuditReminderEmailHtml(auditData),
        textContent: this.getAuditReminderEmailText(auditData)
      });

      console.log('Audit review reminder email sent successfully:', result.response);
    } catch (error) {
      console.error('Failed to send audit review reminder email:', error);
      throw error;
    }
  }

  private getAuditReminderEmailHtml(auditData: {
    auditTitle: string;
    auditType: string;
    serviceType: string;
    completedDate: string;
    nextReviewDate: string;
    daysUntilDue: number;
    auditorName: string;
    overallRating?: string;
    areasForImprovement?: string;
  }): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>CQC Audit Review Reminder</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0; }
        .audit-details { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #f59e0b; }
        .urgency-notice { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; padding: 20px; color: #64748b; font-size: 14px; }
        .btn { display: inline-block; background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        .rating-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
        .outstanding { background: #dcfce7; color: #166534; }
        .good { background: #dbeafe; color: #1d4ed8; }
        .requires_improvement { background: #fef3c7; color: #b45309; }
        .inadequate { background: #fee2e2; color: #dc2626; }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">🏥 Smeaton Healthcare</div>
        <h1>CQC Audit Review Reminder</h1>
    </div>
    
    <div class="content">
        <div class="urgency-notice">
            <strong>⚠️ Review Required in ${auditData.daysUntilDue} days</strong><br>
            This CQC audit is due for review on <strong>${auditData.nextReviewDate}</strong>
        </div>

        <p>Dear Michael,</p>
        
        <p>This is an automated reminder that one of your CQC audits is approaching its review date. Please ensure this audit is reviewed and updated as necessary to maintain compliance.</p>

        <div class="audit-details">
            <h3>📋 Audit Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Audit Title:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">${auditData.auditTitle}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Audit Type:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">${auditData.auditType.replace('_', ' ').toUpperCase()}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Service Type:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">${auditData.serviceType.replace('_', ' ').toUpperCase()}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Completed Date:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">${auditData.completedDate}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Auditor:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">${auditData.auditorName}</td>
                </tr>
                ${auditData.overallRating ? `
                <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Current Rating:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                        <span class="rating-badge ${auditData.overallRating}">${auditData.overallRating.replace('_', ' ').toUpperCase()}</span>
                    </td>
                </tr>
                ` : ''}
                <tr>
                    <td style="padding: 8px 0;"><strong>Review Due:</strong></td>
                    <td style="padding: 8px 0; color: #f59e0b; font-weight: bold;">${auditData.nextReviewDate}</td>
                </tr>
            </table>
        </div>

        ${auditData.areasForImprovement ? `
        <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <h4>📝 Areas for Improvement (from last review):</h4>
            <p style="margin: 0;">${auditData.areasForImprovement}</p>
        </div>
        ` : ''}

        <div style="margin: 30px 0; text-align: center;">
            <a href="${process.env.REPLIT_DOMAIN || 'https://your-domain.com'}/admin/cqc-toolkit" class="btn">
                Review Audit in CQC Toolkit
            </a>
        </div>

        <p><strong>Next Steps:</strong></p>
        <ul>
            <li>Review the current audit findings and evidence</li>
            <li>Update any areas for improvement that have been addressed</li>
            <li>Collect new evidence if required</li>
            <li>Schedule the next review date</li>
            <li>Ensure all documentation is CQC-ready</li>
        </ul>

        <p><strong>Important:</strong> Regular audit reviews are essential for maintaining CQC compliance and ensuring continuous improvement in care quality.</p>
    </div>

    <div class="footer">
        <p>This automated reminder was sent from the Smeaton Healthcare CQC Compliance System</p>
        <p>© ${new Date().getFullYear()} Smeaton Healthcare. All rights reserved.</p>
        <p>Healthcare staffing solutions across Devon and Cornwall</p>
    </div>
</body>
</html>
    `;
  }

  private getAuditReminderEmailText(auditData: {
    auditTitle: string;
    auditType: string;
    serviceType: string;
    completedDate: string;
    nextReviewDate: string;
    daysUntilDue: number;
    auditorName: string;
    overallRating?: string;
    areasForImprovement?: string;
  }): string {
    return `
CQC AUDIT REVIEW REMINDER

Dear Michael,

This is an automated reminder that one of your CQC audits is approaching its review date in ${auditData.daysUntilDue} days.

AUDIT DETAILS:
- Title: ${auditData.auditTitle}
- Type: ${auditData.auditType.replace('_', ' ').toUpperCase()}
- Service: ${auditData.serviceType.replace('_', ' ').toUpperCase()}
- Completed: ${auditData.completedDate}
- Auditor: ${auditData.auditorName}
${auditData.overallRating ? `- Current Rating: ${auditData.overallRating.replace('_', ' ').toUpperCase()}` : ''}
- REVIEW DUE: ${auditData.nextReviewDate}

${auditData.areasForImprovement ? `AREAS FOR IMPROVEMENT (from last review):
${auditData.areasForImprovement}

` : ''}NEXT STEPS:
1. Review the current audit findings and evidence
2. Update any areas for improvement that have been addressed
3. Collect new evidence if required
4. Schedule the next review date
5. Ensure all documentation is CQC-ready

Access the CQC Toolkit: ${process.env.REPLIT_DOMAIN || 'https://your-domain.com'}/admin/cqc-toolkit

Regular audit reviews are essential for maintaining CQC compliance and ensuring continuous improvement in care quality.

---
This automated reminder was sent from the Smeaton Healthcare CQC Compliance System
© ${new Date().getFullYear()} Smeaton Healthcare. All rights reserved.
Healthcare staffing solutions across Devon and Cornwall
    `;
  }
}

export const brevoService = new BrevoService();