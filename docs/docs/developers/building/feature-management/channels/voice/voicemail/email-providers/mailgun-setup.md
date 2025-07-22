---
sidebar_label: Mailgun Setup  
sidebar_position: 1
title: "Mailgun Email Integration Setup"
---

# Option C: Email-Enabled Voicemail Setup

This guide walks you through implementing the **callback-and-voicemail-with-email** template feature, which provides a complete voicemail solution with automated email notifications.

:::info You're implementing Option C
This is the most advanced voicemail option. If you need something simpler, see the [Voicemail Implementation Guide](../voicemail-implementation-guide) for other options.
:::

## What You're Building

**Caller Experience:**
1. Calls your client's number
2. Waits in queue with hold music and options
3. Can press * anytime to request callback OR leave voicemail
4. Professional in-queue experience

**Administrator Experience:**
1. Receives instant email notification when voicemails are left
2. Email includes audio recording as attachment
3. Complete transcription included in email
4. Professional formatting with all call details

**Agent Experience:**
1. Voicemail tasks appear normally in Flex
2. All standard callback and voicemail handling
3. No workflow changes required

---

## Prerequisites

### Required Access:
- ✅ Admin access to your organization's Connie deployment
- ✅ Access to your client's domain DNS settings  
- ✅ Your client's admin email address

### Accounts Needed:
- ✅ Mailgun account (free tier supports 100 emails/day)
- ✅ Domain registrar access (GoDaddy, Namecheap, etc.)

:::tip New to Connie?
This guide assumes you have basic familiarity with environment configuration. If you're new, allow extra time for the DNS setup steps.
:::

---

## Step 1: Client Information Gathering

Before starting, collect this information from your client:

```bash
# CLIENT CONFIGURATION TEMPLATE
# Copy this and fill in your client's actual values

CLIENT_ORGANIZATION_NAME="Your Client's Organization Name"
CLIENT_DOMAIN="clientdomain.com" 
CLIENT_ADMIN_EMAIL="admin@clientdomain.com"
CLIENT_PHONE_NUMBER="+18005551234"

# You'll create these in the next steps:
MAILGUN_DOMAIN="voicemail.clientdomain.com"
MAILGUN_API_KEY="[Will be generated]"
```

---

## Step 2: Mailgun Account Setup

### Create Mailgun Account

1. Go to [mailgun.com](https://mailgun.com) and create an account
2. Choose **US** region (recommended for most clients)
3. Verify your email and complete account setup

### Add Your Client's Domain

**Use a dedicated subdomain** for best deliverability:

1. **Recommended format:** `voicemail.[clientdomain].com`
2. **Example:** If client domain is `helpinghand.org`, use `voicemail.helpinghand.org`

**Setup steps:**
1. In Mailgun dashboard → **Sending** → **Domains**
2. Click **Add New Domain**
3. Enter: `voicemail.[YOUR_CLIENT_DOMAIN]`
4. Select **US** region
5. Click **Add Domain**

### Configure DNS Records

Mailgun will provide DNS records. Add these to your client's domain:

```dns
# Example DNS records (yours will be different)
Type: TXT
Name: voicemail.helpinghand.org
Value: v=spf1 include:mailgun.org ~all

Type: TXT
Name: smtp._domainkey.voicemail.helpinghand.org  
Value: k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQ...

Type: CNAME
Name: email.voicemail.helpinghand.org
Value: mailgun.org

Type: MX
Name: voicemail.helpinghand.org
Value: 10 mxa.mailgun.org
```

:::warning DNS Propagation Time
DNS changes take 1-24 hours to propagate. You can check verification status in Mailgun dashboard under **Domains** → **Domain Verification**.
:::

### Get Your Sending API Key

:::warning Critical: Use Domain-Specific Sending Key
**Do NOT use the Private API key from Settings → API Keys.** You need a domain-specific sending key for the email functionality to work properly.
:::

After your domain is created and DNS records are configured:

1. **Navigate to your domain:** Mailgun dashboard → **Sending** → **Domains** 
2. **Click on your domain** (e.g., `voicemail.clientdomain.com`)
3. **Go to Domain Settings:** Click **Domain settings** button
4. **Access Sending Keys:** Click the **Sending keys** tab

![Mailgun Domain Settings - Sending Keys Tab](/img/mailgun/mailgun-sending-keys-tab.png)

5. **Create a sending key:** Click **Add sending key**
6. **Copy both values:**
   - **Key ID** (e.g., `45de04af-85e71f21`) 
   - **API Send Key** (long string starting with various prefixes)

![Mailgun Sending Key Details](/img/mailgun/mailgun-sending-key-details.png)

7. **Use the API Send Key** for your `MAILGUN_API_KEY` environment variable
8. Save both the Key ID and API Send Key in a secure location

### Test Mailgun Setup

Before proceeding, test email delivery:

1. Mailgun dashboard → **Sending** → **Overview**
2. Use **Send Test Email** feature
3. Send to your client's admin email
4. Confirm delivery

---

## Step 3: Configure Template Feature

The voicemail-with-email functionality is **already built into your ConnieRTC template**. You just need to configure it.

### Update Environment Variables

In your Connie deployment, add these environment variables to Twilio Functions:

```bash
# REQUIRED ENVIRONMENT VARIABLES
# Add these to your Twilio Functions environment

ADMIN_EMAIL=admin@clientdomain.com
MAILGUN_DOMAIN=voicemail.clientdomain.com  
MAILGUN_API_KEY=your-mailgun-sending-api-key
```

:::warning Use the Sending API Key
The `MAILGUN_API_KEY` must be the **API Send Key** from the domain's Sending keys tab, NOT the Private API key from Settings → API Keys.
:::

**How to add environment variables:**
1. Twilio Console → **Functions & Assets** → **Services**
2. Select your ConnieRTC serverless service
3. **Settings** → **Environment Variables**
4. Add the three variables above

### Update Feature Configuration

Enable the feature in your Flex configuration:

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

## Step 4: Deploy the Implementation

### Deploy Serverless Functions

```bash
# Navigate to your ConnieRTC template directory
cd serverless-functions

# Deploy the updated functions with your new environment variables
npm run deploy
```

Expected output shows the email function deployed:
```
protected /features/callback-and-voicemail-with-email/studio/send-voicemail-email
protected /features/callback-and-voicemail-with-email/studio/wait-experience
```

### Apply Infrastructure Changes

```bash
# Navigate to terraform directory
cd infra-as-code/terraform/environments/default

# Enable the callback-and-voicemail-with-email module in your tfvars
# Add this line to your local.tfvars:
# callback_and_voicemail_with_email_enabled = true

# Apply the changes
terraform plan -var-file="local.tfvars"
terraform apply -var-file="local.tfvars"
```

This creates:
- ✅ TaskRouter workflow for callback/voicemail routing
- ✅ Studio Flow with email integration  
- ✅ All required serverless functions

### Connect to Phone Number

1. Twilio Console → **Phone Numbers** → **Active Numbers**
2. Click your client's phone number
3. **Voice Configuration** → **A call comes in**
4. Select the new Studio Flow: **"Template Example Callback With Email Flow"**
5. Save configuration

---

## Step 5: Test Your Implementation

### Complete Test Workflow

1. **Call the client's number**
2. **Listen to the greeting** and wait for options
3. **Press * (star)** during hold music
4. **Press 2** for voicemail option
5. **Leave a test message** (say your name and timestamp)
6. **Hang up**

### Expected Results

**In Flex:**
- Voicemail task appears in the queue
- Task contains recording and transcription
- Agents can handle normally

**In Email:**
- Email arrives at admin address within 1-2 minutes
- Subject: "New Voicemail from [phone number]"
- Body includes all call details and transcription
- .wav audio file attached

**Sample Email Content:**
```
New voicemail received:

From: +15105551234
To: +18005551234
Date: 2024-01-15T14:30:00.000Z
Recording ID: REabc123...

Transcription:
Hi, this is John testing the voicemail system at 2:30 PM.

The audio recording is attached to this email.

---
This is an automated message. Please do not reply.
```

---

## Step 6: Production Optimization

### Monitoring Setup

**Check these regularly:**
- Mailgun dashboard for delivery rates
- Twilio Function logs for errors
- DNS record status

**Monthly maintenance:**
- Test complete voicemail-to-email flow
- Review Mailgun usage and costs
- Verify DNS records unchanged

### Performance Considerations

**File Size Handling:**
- Files under 20MB: Attached directly
- Files over 20MB: Download link provided
- Automatic timeout protection

**Email Delivery:**
- Typical delivery: 1-5 seconds
- Free tier: 100 emails/day
- Paid plans available for higher volume

---

## Troubleshooting

### No Email Received

**Check Mailgun logs:**
1. Mailgun dashboard → **Logs**
2. Look for your test email
3. Check delivery status

**Common issues:**
- DNS records not propagated (wait 24 hours)
- Wrong API key format
- Admin email in spam folder

### Email Without Attachment

**Check Function logs:**
1. Twilio Console → **Functions** → **Logs**
2. Look for voicemail function execution
3. Check for download errors

**Common issues:**
- Recording URL not accessible
- Network timeout during download
- File size exceeded limits

### Voicemail Task Not Created

**This indicates email integration broke the core functionality:**
1. Check Function logs for errors
2. Verify all environment variables present
3. Test with original callback-and-voicemail feature

**Quick fix:**
- Disable email temporarily by removing ADMIN_EMAIL environment variable
- Redeploy functions
- Test core voicemail functionality

---

## Cost Planning

### Mailgun Costs
- **Free tier:** 100 emails/day
- **Flex plans:** Start at $35/month for 1,250/month
- **Pay-as-you-go:** Available for variable volume

### Estimating Volume
- Average organization: 5-20 voicemails/day
- High-volume organizations: 50+ voicemails/day
- Plan accordingly for your client's expected usage

---

## Security Best Practices

### API Key Management
- Store keys in Twilio Functions environment variables only
- Never commit keys to code repositories  
- Rotate keys quarterly
- Use separate keys for testing vs production

### Email Security
- Use dedicated subdomain (voicemail.domain.com)
- Implement all DNS security records (SPF, DKIM, DMARC)
- Monitor DNS for unauthorized changes
- Set up proper reverse DNS

### Data Privacy
- Voicemail recordings contain sensitive data
- Ensure Mailgun account complies with client's privacy requirements
- Consider email encryption for sensitive environments
- Implement retention policies

---

## Professional Services Available

:::tip Need Implementation Help?
Our team can handle the complete setup including:
- Mailgun account configuration
- DNS record setup
- Template deployment and testing
- Client training and documentation

Contact your Connie representative for professional services options.
:::

---

Your client now has enterprise-grade voicemail functionality with automated email notifications and professional caller experience!

## Next Steps

- [Set up additional email recipients](./advanced-email-config)
- [Configure branded email templates](./email-customization)  
- [Monitor and maintain your deployment](./monitoring-guide)