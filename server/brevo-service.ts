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

  // Method to set API key at runtime (bypasses environment variables)
  setApiKey(apiKey: string): boolean {
    const trimmed = apiKey.trim();
    
    if (!this.isValidApiKey(trimmed)) {
      console.error('Invalid Brevo API key format');
      return false;
    }

    try {
      this.emailApi.setApiKey(TransactionalEmailsApiApiKeys.apiKey, trimmed);
      this.isConfigured = true;
      console.log('Brevo service configured successfully via runtime');
      return true;
    } catch (error) {
      console.error('Failed to configure Brevo service:', error);
      this.isConfigured = false;
      return false;
    }
  }

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
          email: 'admin@smeatonhealthcare.co.uk',
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
          email: 'admin@smeatonhealthcare.co.uk',
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
          email: 'noreply@smeatonhealthcare.co.uk',
          name: 'Smeaton Healthcare Website'
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
          email: 'admin@smeatonhealthcare.co.uk',
          name: 'Smeaton Healthcare Website'
        },
        replyTo: {
          email: referralData.referrerEmail,
          name: referralData.referrerName
        }
      });

      console.log('Referral email sent successfully:', result.body?.messageId || 'Email sent');
      return result;
    } catch (error) {
      console.error('Failed to send referral email:', error);
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
            <a href="${process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}/admin` : 'https://your-domain.com/admin'}" class="button">
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

You can access the admin portal at: ${process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}/admin` : 'https://your-domain.com/admin'}

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
    const passwordCreationUrl = `${process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : 'https://your-domain.com'}/create-password?token=${token}`;
    console.log('Generated password creation URL:', passwordCreationUrl);
    
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
    const passwordCreationUrl = `${process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : 'https://your-domain.com'}/create-password?token=${token}`;
    
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
            <h1>New Contact Form Submission</h1>
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
}

export const brevoService = new BrevoService();