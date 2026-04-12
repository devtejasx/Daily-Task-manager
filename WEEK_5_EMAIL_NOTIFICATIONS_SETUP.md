# Week 5: Email Notifications Setup Guide

## Overview
Week 5 implements email notifications for team invitations, allowing invited users to receive professional emails when they're invited to join a team.

## Features Implemented ✅

### EmailService (`backend/src/services/EmailService.ts`)
- Complete email sending service with support for multiple providers
- Professional HTML email templates
- Error handling (doesn't block team operations if email fails)
- Support for:
  - **Gmail** (for personal/development)
  - **SendGrid** (recommended for production)
  - **Ethereal Email** (free testing option)

### Team Integration
- Automatic email sent when user is invited to team
- Automatic notification sent to inviter when invitation is accepted
- Links in emails for accepting/declining invitations (direct in email)

### Email Templates
1. **Team Invitation Email**
   - Shows team name and description
   - Shows who invited them
   - Accept/Decline buttons
   - 7-day expiration notice

2. **Invitation Accepted Email**
   - Confirms new member joined
   - Shows member name
   - Encourages team collaboration

## Setup Instructions

### Option 1: Development Mode (FREE - Recommended for Testing)

**Best for**: Local development and testing

1. **No setup required!** EmailService defaults to Ethereal Email (catch-all service)
2. Emails are caught and displayed in console/logs
3. Perfect for testing the email flow

**Console Output:**
```
Email sent: <message-id>
Team invitation email sent to user@example.com
```

### Option 2: Gmail Setup (For Development/Small Teams)

**Prerequisites:**
- Google account
- App-specific password generated

**Steps:**

1. **Generate Gmail App Password:**
   - Go to [myaccount.google.com/security](https://myaccount.google.com/security)
   - Enable 2-Factor Authentication
   - Generate App Password (select "Mail" and "Windows Computer")
   - Copy the 16-character password

2. **Update `.env` file:**
   ```env
   EMAIL_PROVIDER=gmail
   GMAIL_USER=your-email@gmail.com
   GMAIL_PASSWORD=xxxx-xxxx-xxxx-xxxx
   EMAIL_FROM=your-email@gmail.com
   ```

3. **Restart backend server**

4. **Test it:**
   - Create a team
   - Invite a user
   - Check Gmail sent box

### Option 3: SendGrid Setup (Recommended for Production)

**Best for**: Production deployments, professional emails

**Steps:**

1. **Create SendGrid Account:**
   - Visit [sendgrid.com](https://sendgrid.com)
   - Sign up for free account (100 emails/day free tier)
   - Verify sender email address

2. **Get API Key:**
   - Go to Settings → API Keys
   - Create new API key with "Mail Send" permissions
   - Copy the key

3. **Update `.env` file:**
   ```env
   EMAIL_PROVIDER=sendgrid
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxx
   EMAIL_FROM=noreply@yourdomain.com
   ```

4. **Restart backend server**

5. **Test it:**
   - Create a team
   - Invite a user
   - Check inbox for invitation email

### Option 4: Ethereal Email (FREE - Best for Manual Testing)

**Best for**: Testing email templates without real email account

**Steps:**

1. **Create Ethereal Account:**
   - Visit [ethereal.email](https://ethereal.email)
   - Click "Create Ethereal Account"
   - Get credentials

2. **Update `.env` file:**
   ```env
   EMAIL_PROVIDER=development
   ETHEREAL_USER=your-ethereal-user@ethereal.email
   ETHEREAL_PASSWORD=your-ethereal-password
   ```

3. **Restart backend server**

4. **View Emails:**
   - Log in to Ethereal dashboard
   - View all sent emails
   - See exact HTML rendering

## Environment Variables Reference

```env
# Email Provider Selection
EMAIL_PROVIDER=development          # development, gmail, or sendgrid

# Sender Address (appears in "From" field)
EMAIL_FROM=noreply@taskmanager.app

# Gmail Configuration (if EMAIL_PROVIDER=gmail)
GMAIL_USER=your-email@gmail.com
GMAIL_PASSWORD=app-password         # 16-character app-specific password

# SendGrid Configuration (if EMAIL_PROVIDER=sendgrid)
SENDGRID_API_KEY=SG.xxxx...        # 69+ character API key

# Ethereal Configuration (if EMAIL_PROVIDER=development)
ETHEREAL_USER=test@ethereal.email
ETHEREAL_PASSWORD=test-password

# Application URLs (for email links)
APP_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000
```

## Testing Email Notifications

### Manual Test Flow

1. **Start Backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Create Team** (via frontend or API):
   ```bash
   POST /api/teams
   {
     "name": "Test Team",
     "description": "Testing email notifications"
   }
   ```

3. **Invite User** (via frontend or API):
   ```bash
   POST /api/teams/{teamId}/invite
   {
     "email": "test@example.com"
   }
   ```

4. **Check Email:**
   - **Development mode**: Check console logs
   - **Gmail**: Check Gmail inbox
   - **SendGrid**: Check SendGrid dashboard
   - **Ethereal**: Check Ethereal dashboard

5. **Accept Invitation** (via frontend or API):
   ```bash
   POST /api/teams/invitations/{id}/accept
   ```

6. **Verify Acceptance Email:**
   - Inviter should receive notification email
   - Shows new member name and team

### API Testing with cURL

```bash
# Create team
curl -X POST http://localhost:5000/api/teams \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","description":"Test team"}'

# Invite user (sends invitation email)
curl -X POST http://localhost:5000/api/teams/{teamId}/invite \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@example.com"}'

# Accept invitation (sends acceptance email)
curl -X POST http://localhost:5000/api/teams/invitations/{invitationId}/accept \
  -H "Authorization: Bearer {token}"
```

## Email Service Architecture

### EmailService Class (`backend/src/services/EmailService.ts`)

**Key Methods:**
- `sendTeamInvitation(data)` - Send team invitation email
- `sendInvitationAcceptedConfirmation(email, memberName, teamName)` - Send acceptance notification

**Features:**
- Provider abstraction (same code works for Gmail, SendGrid, Ethereal)
- HTML email templates with inline styling
- Error handling (errors logged but don't block operations)
- Support for email variables (user name, team name, etc.)

### Integration Points

1. **TeamService.inviteUserToTeam()**
   - Creates invitation in database
   - Sends invitation email
   - Continues even if email fails

2. **TeamService.acceptInvitation()**
   - Adds user to team
   - Updates invitation status
   - Sends acceptance notification to inviter

## Troubleshooting

### Emails Not Sending

**Check 1: Environment Variables**
```bash
# In backend, verify EMAIL_PROVIDER is set:
echo $EMAIL_PROVIDER
# Should output: development, gmail, or sendgrid
```

**Check 2: Backend Logs**
```bash
# Look for error messages:
"Failed to send team invitation email"
```

**Check 3: Provider Credentials**
- Gmail: Verify app-specific password (not regular password)
- SendGrid: Verify API key is valid and has "Mail Send" permission
- Ethereal: Verify credentials are correct

**Check 4: Network Issues**
```bash
# Test SMTP connectivity:
telnet smtp.gmail.com 587
telnet smtp.sendgrid.net 587
```

### Common Errors

**Gmail: "Invalid login"**
- Solution: Use app-specific password, not account password
- Ensure 2FA is enabled

**SendGrid: "Invalid API key"**
- Solution: Verify full API key, check permissions
- Create new key if needed

**Development mode: "No matches found"**
- Normal behavior - emails sent to Ethereal catch-all
- Check Ethereal dashboard for sent emails

## Customizing Email Templates

### Modify Templates

Templates are in `EmailService.ts` methods:
- `getTeamInvitationTemplate()` - Team invitation HTML
- `getInvitationAcceptedTemplate()` - Acceptance confirmation HTML

To customize:
1. Edit HTML in `backend/src/services/EmailService.ts`
2. Modify colors, layout, text, links
3. Restart backend server

### Email Variables Available

**Team Invitation:**
- `${data.invitedEmail}` - Invited user's email
- `${data.teamName}` - Team name
- `${data.teamDescription}` - Team description
- `${data.invitedByName}` - Inviter's name
- `${data.acceptUrl}` - Accept link
- `${data.declineUrl}` - Decline link

**Acceptance Confirmation:**
- `${newMemberName}` - New member's name
- `${teamName}` - Team name

## Best Practices

### Security
- ✅ Never log sensitive data (API keys, passwords)
- ✅ Use environment variables for credentials
- ✅ Never commit `.env` files
- ✅ Rotate API keys periodically

### Reliability
- ✅ Email failures don't block team operations
- ✅ Log all email attempts
- ✅ Monitor email service health
- ✅ Implement retry logic for failed emails (future)

### Performance
- ✅ Email sending is async (non-blocking)
- ✅ Consider email queue for high volume (future)
- ✅ Cache email templates (current implementation)

### User Experience
- ✅ Professional email design
- ✅ Clear call-to-action buttons
- ✅ Plain text fallback (future)
- ✅ Unsubscribe option (future, for marketing)

## Production Deployment

### Recommended Setup for Production

```env
# Production Email Configuration
EMAIL_PROVIDER=sendgrid              # Use SendGrid for reliability
SENDGRID_API_KEY=${SENDGRID_API_KEY} # Set via deployment platform
EMAIL_FROM=noreply@yourcompany.com

# URLs point to production domain
APP_URL=https://app.yourcompany.com
FRONTEND_URL=https://app.yourcompany.com

# Security
NODE_ENV=production
```

### Deployment Steps

1. **Set up SendGrid account**
2. **Generate API key with "Mail Send" permission**
3. **Set environment variables** in deployment platform:
   - Vercel: Project Settings → Environment Variables
   - Heroku: `heroku config:set EMAIL_PROVIDER=sendgrid`
   - Railway: Environment variables section
4. **Deploy backend**
5. **Test invitation flow** in production

## Monitoring & Logging

### Email Service Logs

Emails are logged automatically:
```
Team invitation email sent to user@example.com
Invitation accepted notification sent to inviter@example.com
Email sent: <message-id>
```

### Troubleshooting Commands

```bash
# View backend logs
npm run dev 2>&1 | grep -i email

# Test SMTP connection
nc -zv smtp.sendgrid.net 587

# Verify environment variables
env | grep EMAIL
```

## Next Steps

### Phase 2 Enhancements (Future)

- [ ] Email queue system (Bull) for reliability
- [ ] Retry logic for failed emails
- [ ] Email templates in database (not hardcoded)
- [ ] Unsubscribe management
- [ ] Email analytics
- [ ] Plain text fallback
- [ ] Digest emails
- [ ] Custom email branding

### Related Features

- [ ] Notification preferences (in-app settings)
- [ ] Do Not Disturb hours
- [ ] Email frequency control
- [ ] SMS notifications (optional)

## Reference Links

- [SendGrid Documentation](https://docs.sendgrid.com)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [Ethereal Email](https://ethereal.email)
- [Nodemailer](https://nodemailer.com)

## Support

For issues with email setup:
1. Check browser console for error messages
2. Check backend logs for email service errors
3. Verify environment variables are set correctly
4. Test with development mode first
5. Verify SMTP connectivity

---

**Implementation Date**: April 11, 2026  
**Status**: ✅ COMPLETE & READY FOR TESTING
