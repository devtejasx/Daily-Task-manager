import nodemailer from 'nodemailer'

interface EmailOptions {
  to: string
  subject: string
  html: string
}

interface TeamInvitationEmailData {
  invitedEmail: string
  teamName: string
  teamDescription?: string
  invitedByName: string
  acceptUrl: string
  declineUrl: string
}

export class EmailService {
  private transporter: nodemailer.Transporter

  constructor() {
    // Configure nodemailer transporter
    const emailProvider = process.env.EMAIL_PROVIDER || 'sendgrid'

    if (emailProvider === 'gmail') {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASSWORD,
        },
      })
    } else if (emailProvider === 'sendgrid') {
      // SendGrid via SMTP
      this.transporter = nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        auth: {
          user: 'apikey',
          pass: process.env.SENDGRID_API_KEY,
        },
      })
    } else {
      // Development/test mode - use Ethereal Email (catch-all for testing)
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
          user: process.env.ETHEREAL_USER || 'test@example.com',
          pass: process.env.ETHEREAL_PASSWORD || 'test',
        },
      })
    }
  }

  /**
   * Send team invitation email
   */
  async sendTeamInvitation(data: TeamInvitationEmailData): Promise<void> {
    try {
      const html = this.getTeamInvitationTemplate(data)

      const mailOptions: EmailOptions = {
        to: data.invitedEmail,
        subject: `You're invited to join ${data.teamName}!`,
        html,
      }

      await this.send(mailOptions)
      console.log(`Team invitation email sent to ${data.invitedEmail}`)
    } catch (error) {
      console.error('Failed to send team invitation email:', error)
      // Don't throw - invitation should succeed even if email fails
    }
  }

  /**
   * Send invitation acceptance confirmation
   */
  async sendInvitationAcceptedConfirmation(
    inviterEmail: string,
    newMemberName: string,
    teamName: string
  ): Promise<void> {
    try {
      const html = this.getInvitationAcceptedTemplate(newMemberName, teamName)

      const mailOptions: EmailOptions = {
        to: inviterEmail,
        subject: `${newMemberName} joined ${teamName}!`,
        html,
      }

      await this.send(mailOptions)
      console.log(`Invitation accepted notification sent to ${inviterEmail}`)
    } catch (error) {
      console.error('Failed to send acceptance confirmation:', error)
    }
  }

  /**
   * Send generic email
   */
  private async send(options: EmailOptions): Promise<void> {
    try {
      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@taskmanager.app',
        ...options,
      })

      console.log('Email sent:', info.messageId)
    } catch (error) {
      console.error('Email sending error:', error)
      throw error
    }
  }

  /**
   * Team invitation email template
   */
  private getTeamInvitationTemplate(data: TeamInvitationEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .team-info { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #667eea; }
            .team-name { font-size: 24px; font-weight: bold; color: #667eea; }
            .team-desc { color: #666; margin-top: 8px; }
            .invited-by { color: #999; margin-top: 12px; font-size: 14px; }
            .buttons { margin: 30px 0; }
            .button { display: inline-block; padding: 12px 30px; margin: 10px 10px 10px 0; border-radius: 6px; text-decoration: none; font-weight: bold; }
            .accept { background: #667eea; color: white; }
            .decline { background: #e5e7eb; color: #333; }
            .button:hover { opacity: 0.9; }
            .footer { color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Team Invitation</h1>
              <p>You're invited to collaborate on a new team!</p>
            </div>
            <div class="content">
              <p>Hi <strong>${data.invitedEmail}</strong>,</p>
              
              <p><strong>${data.invitedByName}</strong> has invited you to join their team:</p>
              
              <div class="team-info">
                <div class="team-name">${data.teamName}</div>
                ${data.teamDescription ? `<div class="team-desc">${data.teamDescription}</div>` : ''}
                <div class="invited-by">Invited by <strong>${data.invitedByName}</strong></div>
              </div>
              
              <p>Join the team to start collaborating and sharing tasks with your teammates!</p>
              
              <div class="buttons">
                <a href="${data.acceptUrl}" class="button accept">Accept Invitation</a>
                <a href="${data.declineUrl}" class="button decline">Decline</a>
              </div>
              
              <p style="color: #999; font-size: 12px;">
                <strong>Note:</strong> This invitation will expire in 7 days. If you don't have an account yet, you'll need to create one to accept this invitation.
              </p>
            </div>
            
            <div class="footer">
              <p>© 2026 Task Manager. All rights reserved.</p>
              <p>This is an automated message. Please don't reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `
  }

  /**
   * Invitation accepted confirmation template
   */
  private getInvitationAcceptedTemplate(newMemberName: string, teamName: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .success-box { background: #ecfdf5; border-left: 4px solid #10b981; padding: 20px; border-radius: 6px; }
            .success-box h2 { color: #10b981; margin-top: 0; }
            .footer { color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Welcome Aboard!</h1>
            </div>
            <div class="content">
              <p>Great news! <strong>${newMemberName}</strong> has accepted your invitation and joined <strong>${teamName}</strong>.</p>
              
              <div class="success-box">
                <h2>🎉 Team Growing!</h2>
                <p>Your team is expanding! You can now share tasks and collaborate with <strong>${newMemberName}</strong>.</p>
              </div>
              
              <p>Visit your team page to get started with task collaboration.</p>
            </div>
            
            <div class="footer">
              <p>© 2026 Task Manager. All rights reserved.</p>
              <p>This is an automated message. Please don't reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `
  }
}
