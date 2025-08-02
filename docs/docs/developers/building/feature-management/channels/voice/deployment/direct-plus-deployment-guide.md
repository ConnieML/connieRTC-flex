---
sidebar_label: Direct+ Deployment Guide
sidebar_position: 1
title: "Direct+ Deployment Kit - Complete Implementation Guide"
---

# Direct+ Deployment Kit - Complete Implementation Guide

This comprehensive guide provides step-by-step instructions for deploying the Direct+ workflow (callback-and-voicemail-with-email) to new Connie accounts. Follow this guide precisely to ensure successful deployment.

:::tip For Claude Agents
This deployment kit is designed to be followed step-by-step by any Claude agent. Each section includes validation steps, troubleshooting, and rollback procedures.  
:::

## What You're Deploying

The **Direct+ workflow** provides:
- Professional call center experience with hold music
- In-queue options: Press * for callback or voicemail
- Automated email notifications with voicemail attachments
- Complete Flex task management integration

**Caller Experience:**
1. Caller dials number → Professional greeting
2. Call rings to agents with hold music
3. Press * anytime for options: Callback (1) or Voicemail (2)
4. Professional queue management

**Administrator Experience:**
1. Instant email notifications for voicemails
2. Audio attachments and transcriptions included
3. Complete call details and metadata

## Prerequisites & Pre-Deployment

**CRITICAL:** Complete the [Pre-Deployment Checklist](/developers/building/feature-management/channels/voice/deployment/pre-deployment-checklist) before starting deployment.

Required access and information:
- ✅ Twilio Console admin access
- ✅ Client domain DNS access (for email setup)
- ✅ Client administrator email addresses
- ✅ Target phone number for configuration

## Deployment Phases Overview

| Phase | Duration | Dependencies |
|-------|----------|-------------|
| **1. Pre-Deployment** | 30 mins | Client info gathering |
| **2. Email Provider Setup** | 2-24 hours | DNS propagation time |
| **3. Twilio Configuration** | 45 mins | Email setup complete |
| **4. Deployment & Testing** | 30 mins | All previous phases |
| **5. Validation & Handoff** | 15 mins | Working deployment |

---

# Phase 1: Pre-Deployment Setup

## 1.1 Client Configuration Gathering

Use the [Configuration Template](/developers/building/feature-management/channels/voice/deployment/configuration-template) to collect all required information.

**Essential Information:**
```bash
# CLIENT CONFIGURATION (Fill this out first)
CLIENT_ORGANIZATION_NAME="Client Name"
CLIENT_DOMAIN="clientdomain.com"
CLIENT_ADMIN_EMAIL="admin@clientdomain.com"
CLIENT_PHONE_NUMBER="+18005551234"

# Generated during setup:
MAILGUN_DOMAIN="voicemail.clientdomain.com"
MAILGUN_API_KEY="[Generated in Phase 2]"
TWILIO_WORKSPACE_SID="[Found in Phase 3]"
TWILIO_WORKFLOW_SID="[Found in Phase 3]"
```

## 1.2 Twilio Account Validation

**Verify Twilio CLI Access:**
```bash
# Test Twilio CLI configuration
twilio profiles:list
twilio api:core:accounts:fetch

# Expected output should show active account
```

**Locate Required Twilio Resources:**
```bash
# Find Workspace SID (should start with WS)
twilio api:taskrouter:v1:workspaces:list

# Find "Assign to Anyone" Workflow SID (should start with WW)
twilio api:taskrouter:v1:workspaces:workflows:list \
  --workspace-sid WSxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Save these SIDs - you'll need them in Phase 3.**

---

# Phase 2: Email Provider Setup (Mailgun)

## 2.1 Mailgun Account Creation

**Create Account:**
1. Go to [mailgun.com](https://mailgun.com)
2. Create account with client's business email
3. Choose **US region** (recommended)
4. Complete email verification

## 2.2 Domain Configuration

**Add Email Domain:**
1. Mailgun Dashboard → **Sending** → **Domains**
2. Click **Add New Domain**
3. Enter: `voicemail.[CLIENT_DOMAIN]`
   - Example: `voicemail.helpinghand.org`
4. Select **US** region
5. Click **Add Domain**

**Configure DNS Records:**

Mailgun will provide DNS records similar to these (use YOUR actual values):

```dns
# Add these DNS records to client's domain
Type: TXT
Name: voicemail.clientdomain.com
Value: v=spf1 include:mailgun.org ~all

Type: TXT
Name: smtp._domainkey.voicemail.clientdomain.com
Value: k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQ...

Type: CNAME
Name: email.voicemail.clientdomain.com
Value: mailgun.org

Type: MX
Name: voicemail.clientdomain.com
Value: 10 mxa.mailgun.org
```

:::warning DNS Propagation
DNS changes take 1-24 hours to propagate. Do not proceed until domain is verified in Mailgun dashboard.
:::

## 2.3 API Key Generation

**CRITICAL: Get Domain-Specific Sending Key**

:::danger Wrong API Key = Deployment Failure
Do NOT use the Private API Key from Settings. You need a domain-specific sending key.
:::

**Steps:**
1. Mailgun Dashboard → **Sending** → **Domains**
2. Click on your domain (e.g., `voicemail.clientdomain.com`)
3. **Domain settings** → **Sending keys** tab
4. Click **Add sending key**
5. Copy the **API Send Key** (long string)

**Validate API Key Format:**
- ✅ Correct: `***REMOVED***`
- ❌ Wrong: `key-1234567890abcdef`

## 2.4 Mailgun Testing

**MANDATORY: Test API Before Deployment**

```bash
# Test Mailgun API (replace with your values)
curl -s -w "\nHTTP Status: %{http_code}\n" --user "api:YOUR_SENDING_API_KEY" \
    https://api.mailgun.net/v3/YOUR_DOMAIN/messages \
    -F from='Test <test@YOUR_DOMAIN>' \
    -F to='CLIENT_ADMIN_EMAIL' \
    -F subject='Pre-Deployment API Test' \
    -F text='If you receive this, Mailgun API is working correctly.'
```

**Expected Result:**
```json
{"id":"20250801104855.38483d1186b94dc9@yourdomain.com","message":"Queued. Thank you."}
HTTP Status: 200
```

:::danger STOP if you get:
- **HTTP 401**: Wrong API key - check domain-specific sending key
- **HTTP 404**: Domain not found - verify domain setup
- **Any other error**: Do NOT proceed until resolved
:::

---

# Phase 3: Twilio Configuration

## 3.1 Environment Variables Setup

**Navigate to Twilio Functions:**
1. Twilio Console → **Functions & Assets** → **Services**
2. Select your ConnieRTC serverless service
3. **Settings** → **Environment Variables**

**Add Required Variables:**
```bash
ADMIN_EMAIL=admin@clientdomain.com
MAILGUN_DOMAIN=voicemail.clientdomain.com
MAILGUN_API_KEY=your-domain-specific-sending-api-key
```

:::info Multiple Admin Emails
For multiple recipients: `ADMIN_EMAIL=admin1@domain.com,admin2@domain.com`
:::

## 3.2 Critical Code Update

**MANDATORY: Update Workflow SID**

:::danger #1 Cause of "Option Not Available" Errors
You MUST update the hardcoded workflow SID before deployment.
:::

**File to update:** `/serverless-functions/src/functions/features/callback-and-voicemail-with-email/studio/wait-experience.protected.js`

**Find line ~135:**
```javascript
// BEFORE (example - will cause failures):
const enqueuedWorkflowSid = 'WW3657f8c5b384cdad9c6d37cbaedd1013'; // HHOVV workflow

// AFTER (update with YOUR workflow SID):
const enqueuedWorkflowSid = 'WW68ed6f6bc555f21e436810af747722a9'; // Client's workflow
```

**How to find YOUR workflow SID:**
```bash
# List workflows for your workspace
twilio api:taskrouter:v1:workspaces:workflows:list \
  --workspace-sid WSxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Look for "Assign to Anyone" workflow, copy the SID
```

## 3.3 Feature Configuration

**Update Flex Configuration:**

Add to your Flex configuration JSON:
```json
{
  "features": {
    "callback_and_voicemail_with_email": {
      "enabled": true,
      "allow_requeue": true,
      "max_attempts": 3,
      "auto_select_task": false,
      "enable_email_notifications": true
    }
  }
}
```

---

# Phase 4: Deployment & Infrastructure

## 4.1 Deploy Serverless Functions

```bash
# Navigate to serverless functions directory
cd serverless-functions

# Deploy with updated environment variables
npm run deploy
```

**Expected Output:**
```
domain            custom-flex-extensions-serverless-XXXX-dev.twil.io
...
protected /features/callback-and-voicemail-with-email/studio/send-voicemail-email
protected /features/callback-and-voicemail-with-email/studio/wait-experience
```

:::tip Save Deployment Domain
Copy the deployment domain (e.g., `custom-flex-extensions-serverless-4044-dev.twil.io`) - needed for Studio Flow configuration.
:::

## 4.2 Apply Infrastructure

```bash
# Navigate to terraform directory
cd infra-as-code/terraform/environments/default

# Enable callback-and-voicemail-with-email in local.tfvars
echo 'callback_and_voicemail_with_email_enabled = true' >> local.tfvars

# Plan and apply
terraform plan -var-file="local.tfvars"
terraform apply -var-file="local.tfvars"
```

**This creates:**
- ✅ TaskRouter workflow for callback/voicemail routing
- ✅ Studio Flow with email integration
- ✅ All required serverless functions

## 4.3 Phone Number Configuration

**Connect Studio Flow to Phone Number:**

1. Twilio Console → **Phone Numbers** → **Active Numbers**
2. Click target phone number
3. **Voice Configuration** → **A call comes in**
4. Select: **"Template Example Callback With Email Flow"**
5. Save configuration

**Alternative CLI Method (if Flow doesn't appear):**

Use the [Studio Flow Template](/developers/building/feature-management/channels/voice/deployment/assets/studio-flow-template.json) to create flow via CLI:

```bash
# Download template and update with your values
curl -o callback-flow.json https://raw.githubusercontent.com/.../studio-flow-template.json

# Update placeholders in template:
# - YOUR-DEPLOYMENT-DOMAIN
# - YOUR-WORKFLOW-SID

# Create the flow
twilio api:studio:v2:flows:create \
  --friendly-name "Direct+ Callback and Voicemail Flow" \
  --status published \
  --definition "$(cat callback-flow.json)"
```

---

# Phase 5: Testing & Validation

## 5.1 Automated Pre-Testing

**Run System Health Check:**

```bash
# Check environment variables deployed
twilio api:serverless:v1:services:environments:variables:list \
  --service-sid ZS... \
  --environment-sid ZE...

# Verify these exist:
# - ADMIN_EMAIL
# - MAILGUN_DOMAIN
# - MAILGUN_API_KEY
```

**Test Email Function Directly:**
```bash
# Direct function test
curl -X POST "https://YOUR-DEPLOYMENT-DOMAIN/features/callback-and-voicemail-with-email/studio/send-voicemail-email" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "RecordingSid=REtest123&From=%2B15105551234&CallSid=CAtest123"
```

## 5.2 End-to-End Manual Testing

**Complete Test Workflow:**

1. **Call the configured phone number**
2. **Listen to greeting** (should hear professional greeting)
3. **Wait for hold music** (should hear music, not silence)
4. **Press * (star)** during hold music
5. **Listen for options menu** (should hear "Press 1 for callback, Press 2 for voicemail")
6. **Press 2** for voicemail
7. **Leave test message:** "This is [Your Name] testing voicemail at [current time]"
8. **Hang up**

**Expected Results Timeline:**

| Time | Expected Result |
|------|-----------------|
| Immediately | Call connects, professional greeting plays |
| 0-30 seconds | Hold music plays, can press * for options |
| After pressing *,2 | Voicemail prompt plays, recording starts |
| 1-2 minutes after hangup | Voicemail task appears in Flex |
| 2-5 minutes after hangup | Email arrives at admin address |

## 5.3 Email Validation

**Check Email Received:**
- **Subject:** "New Voicemail from [phone number]"
- **Attachments:** .wav audio file
- **Body includes:**
  - Caller phone number
  - Call timestamp  
  - Recording duration
  - Transcription (if available)

**Sample Expected Email:**
```
New voicemail received:

From: +15105551234
To: +18005551234
Date: 2024-08-01T14:30:00.000Z
Duration: 15 seconds

Transcription:
This is John testing voicemail at 2:30 PM.

The audio recording is attached to this email.

---
This is an automated message. Please do not reply.
```

## 5.4 Flex Task Validation

**Verify in Flex Interface:**
- ✅ Voicemail task appears in queue
- ✅ Task includes recording URL
- ✅ Transcription visible (if available)
- ✅ Agent can accept and handle task normally

---

# Troubleshooting & Common Issues

## Critical Failure Points & Solutions

| Error | Symptom | Root Cause | Solution |
|-------|---------|------------|----------|
| **"Option not available"** | Options menu doesn't work | Wrong workflow SID in code | Update wait-experience.js line 135 |
| **401 Email Error** | No emails sent | Wrong API key type | Use domain sending key, not private key |
| **No Flow in Phone Config** | Can't select Studio Flow | Flow creation failed | Use CLI method to create flow |
| **Tasks Not Created** | No voicemail tasks in Flex | Code deployment issue | Check function logs, redeploy |

## Email Troubleshooting

**No Email Received:**
1. Check Mailgun dashboard logs
2. Verify DNS records propagated (24 hours)
3. Check spam folder
4. Test API directly:
   ```bash
   curl -s --user "api:YOUR_KEY" \
       https://api.mailgun.net/v3/YOUR_DOMAIN/messages \
       -F from='Debug <test@YOUR_DOMAIN>' \
       -F to='ADMIN_EMAIL' \
       -F subject='Debug Test' \
       -F text='Testing'
   ```

**Email Without Attachment:**
1. Check Twilio Function logs for download errors
2. Verify recording URL accessibility
3. Check file size (>25MB may cause issues)

## Function Debugging

**Access Function Logs:**
```bash
# Real-time logs
twilio serverless:logs --service-sid ZS... --environment-sid ZE...

# Or via Console: Functions & Assets → Services → Your Service → Environment → Live Logs
```

**Common Log Messages:**
- ✅ `"Email sent successfully"` - Working correctly
- ❌ `"Authentication failed"` - Check API key
- ❌ `"Recording download failed"` - Check Twilio credentials

---

# Rollback Procedures

## Emergency Rollback Steps

**If deployment fails and calls need to work immediately:**

1. **Disconnect Studio Flow:**
   ```bash
   # Point phone number back to original configuration
   twilio api:core:incoming-phone-numbers:update \
     --sid PNxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx \
     --voice-url "https://original-webhook-url.com/voice"
   ```

2. **Disable Email Feature:**
   ```bash
   # Remove email environment variables
   twilio api:serverless:v1:services:environments:variables:delete \
     --service-sid ZS... --environment-sid ZE... --key ADMIN_EMAIL
   ```

3. **Redeploy Functions:**
   ```bash
   cd serverless-functions
   npm run deploy
   ```

## Partial Rollback Options

**Disable Email Only (Keep Callback/Voicemail):**
- Remove `ADMIN_EMAIL` environment variable
- Redeploy functions
- Test that callback/voicemail still works

**Revert to Basic Direct Calling:**
- Change phone number webhook to simple Flex Studio Flow
- Test that direct calls work normally

---

# Post-Deployment Activities

## 5.1 Client Handoff Documentation

**Create Client Documentation Package:**
- [x] Admin email addresses receiving notifications
- [x] Mailgun dashboard access (if client manages)
- [x] Test phone number and process
- [x] Escalation contacts for issues

**Client Training Points:**
1. How to test the system monthly
2. Where to monitor email delivery (Mailgun dashboard)
3. How to add/remove admin email addresses
4. What to do if emails stop arriving

## 5.2 Monitoring Setup

**Weekly Monitoring:**
- Test complete workflow manually
- Check Mailgun delivery rates
- Review Twilio Function error logs

**Monthly Maintenance:**
- Verify DNS records unchanged
- Test email delivery to all recipients
- Review and rotate API keys if needed

**Quarterly Review:**
- Assess call volume and email costs
- Review Mailgun usage and upgrade plans if needed
- Update documentation with any configuration changes

---

# Success Criteria Checklist

## Deployment Complete When:

**Technical Validation:**
- [ ] Phone number connects to Studio Flow
- [ ] Hold music plays during queue wait
- [ ] * key activates options menu  
- [ ] Option 2 successfully records voicemail
- [ ] Voicemail tasks appear in Flex
- [ ] Email notifications sent within 5 minutes
- [ ] Email includes audio attachment and transcription

**Client Acceptance:**
- [ ] Client can successfully test complete workflow
- [ ] Admin emails received at expected addresses
- [ ] Audio quality acceptable in email attachments  
- [ ] Client understands monitoring and maintenance procedures

**Documentation Complete:**
- [ ] All configuration values documented
- [ ] Client handoff package delivered
- [ ] Escalation procedures established
- [ ] Monitoring schedule confirmed

---

## Support & Escalation

**For Technical Issues During Deployment:**
1. Check [Error Codes Reference](/developers/building/feature-management/channels/voice/troubleshooting/error-codes)
2. Review Twilio Function logs
3. Test individual components (email, Studio Flow, TaskRouter)

**For Complex Issues:**
- Escalate to Twilio Professional Services team
- Provide complete configuration details and error logs
- Include test call recordings and email delivery logs

---

The Direct+ Deployment Kit ensures consistent, reliable deployments of the callback-and-voicemail-with-email workflow. Follow each phase completely, validate at each step, and maintain comprehensive documentation for successful client deployments.