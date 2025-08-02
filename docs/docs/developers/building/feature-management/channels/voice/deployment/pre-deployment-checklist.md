---
sidebar_label: Pre-Deployment Checklist
sidebar_position: 2
title: "Direct+ Pre-Deployment Checklist"
---

# Direct+ Pre-Deployment Checklist

Complete this checklist BEFORE starting deployment. Missing any item will cause deployment failures or require rollbacks.

:::danger Critical Validation
This checklist prevents 90% of deployment failures. Do not skip any section.
:::

---

## Section 1: Access & Permissions Validation

### Twilio Console Access
- [ ] **Twilio Console Admin Access**: Can log into Twilio Console with full admin privileges
- [ ] **Account SID Available**: Located and copied Account SID (format: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
- [ ] **Auth Token Available**: Located and copied Auth Token (secure access)
- [ ] **Twilio CLI Configured**: `twilio profiles:list` shows active profile

**Validation Commands:**
```bash
# Test Twilio CLI access
twilio api:core:accounts:fetch
# Should return account details without errors

# Test profile configuration  
twilio profiles:list
# Should show active profile with checkmark
```

### Client Domain Access
- [ ] **DNS Management Access**: Can add/modify DNS records for client domain
- [ ] **Domain Registrar Access**: Have login credentials for domain registrar (GoDaddy, Namecheap, etc.)
- [ ] **DNS Propagation Time**: Understand 1-24 hour DNS propagation requirement
- [ ] **Subdomain Authority**: Confirmed client authorizes subdomain creation (`voicemail.clientdomain.com`)

**Required DNS Record Types to Add:**
- TXT records (SPF, DKIM)
- CNAME records  
- MX records

### ConnieRTC Template Access
- [ ] **Codebase Access**: Can access and modify ConnieRTC template files
- [ ] **Serverless Functions**: Can deploy to Twilio Functions
- [ ] **Terraform Access**: Can apply infrastructure changes
- [ ] **Environment Variables**: Can modify Twilio Functions environment variables

---

## Section 2: Client Information Collection

### Organization Details
- [ ] **Organization Name**: `________________________________`
- [ ] **Primary Domain**: `________________________________` 
- [ ] **Industry/Business Type**: `________________________________`
- [ ] **Expected Call Volume**: `__________ calls/day`

### Contact Information
- [ ] **Primary Admin Email**: `________________________________`
- [ ] **Secondary Admin Email** (optional): `________________________________`
- [ ] **Technical Contact Name**: `________________________________`
- [ ] **Technical Contact Phone**: `________________________________`

### Phone Number Configuration
- [ ] **Target Phone Number**: `________________________________`
  - Format: +1XXXXXXXXXX (E.164 format)
  - Verified number is purchased and active in Twilio
- [ ] **Current Phone Configuration**: `________________________________`
  - Document existing webhook/Studio Flow for rollback
- [ ] **Business Hours**: `________________________________`
- [ ] **Timezone**: `________________________________`

### Voice Workflow Preferences
- [ ] **Greeting Script Preference**: 
  - [ ] Standard professional greeting
  - [ ] Custom script (attach script)
- [ ] **Hold Music Preference**:
  - [ ] Default Twilio hold music
  - [ ] Custom audio file (client-provided)
- [ ] **Callback Option Required**: [ ] Yes [ ] No
- [ ] **Voicemail Option Required**: [ ] Yes [ ] No
- [ ] **Email Notifications Required**: [ ] Yes [ ] No

---

## Section 3: Technical Requirements Validation

### Twilio Resources Discovery
- [ ] **Workspace SID Located**: `WS________________________________`
- [ ] **"Assign to Anyone" Workflow SID Located**: `WW________________________________`  
- [ ] **Flex Service Available**: Confirmed Flex is active and accessible
- [ ] **TaskRouter Configured**: Confirmed TaskRouter workspace is operational

**Validation Commands:**
```bash
# Find Workspace SID
twilio api:taskrouter:v1:workspaces:list
# Copy the SID starting with WS

# Find Workflow SID  
twilio api:taskrouter:v1:workspaces:workflows:list \
  --workspace-sid WSxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# Find "Assign to Anyone" workflow, copy SID starting with WW
```

### Serverless Functions Environment
- [ ] **Service SID Located**: `ZS________________________________`
- [ ] **Environment SID Located**: `ZE________________________________`
- [ ] **Current Environment Variables Documented**: 
  ```
  ACCOUNT_SID=ACxxx...
  AUTH_TOKEN=xxx...
  WORKSPACE_SID=WSxxx...
  WORKFLOW_SID=WWxxx...
  [Add other existing variables]
  ```
- [ ] **Deployment Domain Format**: `custom-flex-extensions-serverless-XXXX-dev.twil.io`

### Code Repository Status
- [ ] **Latest Template Version**: Using current ConnieRTC-basecamp template
- [ ] **Git Status Clean**: No uncommitted changes that could interfere
- [ ] **Build Environment Working**: `npm install` and `npm run deploy` work locally
- [ ] **Terraform State Current**: Terraform state is up-to-date and accessible

---

## Section 4: Email Provider Requirements

### Mailgun Account Setup
- [ ] **Mailgun Account Created**: Account created at mailgun.com
- [ ] **Account Verified**: Email verification completed
- [ ] **Region Selected**: US region chosen (recommended)
- [ ] **Payment Method Added**: For higher volume if needed

### Domain Configuration Planning
- [ ] **Subdomain Chosen**: `voicemail.[CLIENT_DOMAIN]`
  - Example: `voicemail.helpinghand.org`
- [ ] **DNS Access Confirmed**: Can add required DNS records
- [ ] **DNS Provider Identified**: Know which service manages DNS (Cloudflare, GoDaddy, etc.)

### Email Configuration Requirements
- [ ] **From Address Format**: `noreply@voicemail.[CLIENT_DOMAIN]`
- [ ] **Reply-To Address**: `[ADMIN_EMAIL_ADDRESS]` or `noreply@[CLIENT_DOMAIN]`
- [ ] **Email Subject Format**: "New Voicemail from [PHONE_NUMBER]"
- [ ] **Multiple Recipients Strategy**: 
  - [ ] Separate emails to each recipient  
  - [ ] Single email with multiple recipients

---

## Section 5: Testing & Validation Preparation

### Test Environment Setup
- [ ] **Test Phone Number Available**: Have phone number to make test calls
- [ ] **Test Email Access**: Can check admin email address for test messages
- [ ] **Flex Agent Access**: Have agent login to test task handling
- [ ] **Recording Playback Method**: Way to test voicemail audio quality

### Rollback Planning
- [ ] **Current Configuration Documented**: 
  ```
  Current phone number webhook: ________________________________
  Current Studio Flow SID: ________________________________
  Current environment variables: [documented above]
  ```
- [ ] **Rollback Contact Info**: Know who to contact if rollback needed
- [ ] **Emergency Procedures**: Understand how to quickly disable new features

### Success Criteria Definition
- [ ] **Functional Requirements**:
  - [ ] Phone calls connect successfully
  - [ ] Hold music plays during queue
  - [ ] Options menu (* key) works
  - [ ] Callback option (1) creates tasks
  - [ ] Voicemail option (2) records messages
  - [ ] Email notifications arrive within 5 minutes
- [ ] **Quality Standards**:
  - [ ] Audio quality acceptable in email attachments
  - [ ] Transcription accuracy adequate
  - [ ] Email formatting professional
  - [ ] Flex task handling seamless

---

## Section 6: Timeline & Dependencies

### Critical Path Items
- [ ] **DNS Propagation Time**: Allow 1-24 hours for DNS changes
- [ ] **Mailgun Domain Verification**: Cannot proceed until verified
- [ ] **Code Changes Window**: Scheduled time for deployment activities
- [ ] **Testing Window**: Dedicated time for end-to-end testing

### Stakeholder Coordination
- [ ] **Client Availability**: Client available for testing and sign-off
- [ ] **Technical Team Availability**: Development team available for deployment
- [ ] **Support Team Notification**: Support team aware of new configuration
- [ ] **Business Impact Assessment**: Understand impact of any downtime

---

## Section 7: Pre-Deployment Risk Assessment

### Technical Risks
- [ ] **Single Point of Failure**: Phone number change affects all incoming calls
- [ ] **Email Dependency**: Mailgun service availability for notifications
- [ ] **DNS Propagation**: Timing uncertainty for email functionality
- [ ] **Code Deployment**: Function deployment could affect existing features

### Mitigation Strategies
- [ ] **Rollback Plan Ready**: Step-by-step rollback procedure documented
- [ ] **Monitoring Plan**: Real-time monitoring during deployment
- [ ] **Test Plan**: Comprehensive testing before go-live
- [ ] **Communication Plan**: Stakeholder notification procedures

### Go/No-Go Decision Criteria
- [ ] **All Technical Requirements Met**: Every technical checklist item complete
- [ ] **All Access Confirmed**: Can access all required systems
- [ ] **Client Information Complete**: All required client details collected
- [ ] **Risk Mitigation Prepared**: Rollback and monitoring plans ready

---

## Final Pre-Deployment Validation

### Mandatory Validation Commands

Run these commands before deployment:

```bash
# 1. Verify Twilio CLI access
twilio api:core:accounts:fetch

# 2. Confirm Workspace and Workflow SIDs
twilio api:taskrouter:v1:workspaces:list
twilio api:taskrouter:v1:workspaces:workflows:list \
  --workspace-sid WSxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# 3. Test current serverless functions
twilio api:serverless:v1:services:environments:variables:list \
  --service-sid ZS... --environment-sid ZE...

# 4. Verify git status clean
git status
# Should show "working tree clean"

# 5. Test build environment
cd serverless-functions
npm install
npm run build
# Should complete without errors
```

### Pre-Deployment Sign-Off

**Technical Lead Approval:**
- [ ] All technical requirements verified
- [ ] All access credentials tested
- [ ] Rollback procedures documented
- [ ] Monitoring plan established

**Client Approval:**
- [ ] All client information collected and verified
- [ ] DNS change authorization received
- [ ] Email notification preferences confirmed
- [ ] Testing schedule agreed upon

**Project Manager Approval:**
- [ ] Timeline and dependencies confirmed
- [ ] Stakeholder communication complete
- [ ] Risk assessment and mitigation reviewed
- [ ] Success criteria defined and agreed

---

## Ready for Deployment

:::tip Deployment Readiness
✅ If ALL items above are checked, you are ready to proceed with the [Direct+ Deployment Guide](/developers/building/feature-management/channels/voice/deployment/direct-plus-deployment-guide).

❌ If ANY items are incomplete, resolve them before starting deployment to avoid failures and rollbacks.
:::

**Deployment Start Time**: `_________________________`
**Estimated Completion**: `_________________________`  
**Lead Deployer**: `_________________________`
**Emergency Contact**: `_________________________`

---

This checklist ensures all prerequisites are met before deployment begins. Complete preparation prevents deployment failures and ensures smooth client onboarding to the Direct+ workflow.