# Voicemail-Only with Email Feature

A streamlined voicemail solution that provides immediate voicemail recording without hold queue or callback options, with automated email notifications to administrators.

## Overview

This feature is designed for organizations that want to:
- Provide 24/7 voicemail availability
- Reduce caller wait times by going straight to voicemail
- Ensure no calls are missed with email notifications
- Maintain all voicemails in Flex for agent handling

## Caller Experience

1. **Immediate Greeting**: Caller hears a professional greeting
2. **Record Message**: Prompted to leave a voicemail after the tone
3. **End Recording**: Can press * or hang up when finished
4. **Confirmation**: Hears success message and call ends

No hold music, no wait times, no callback options - just efficient voicemail capture.

## Administrator Experience

- **Instant Email Notification**: Receive email when voicemail is left
- **Audio Attachment**: .wav file attached to email (up to 20MB)
- **Full Transcription**: Message text included in email body
- **Professional Formatting**: Branded HTML email with all details
- **Multiple Recipients**: Supports comma-separated admin emails

## Agent Experience

- **Flex Task Created**: Voicemail appears as task in queue
- **Standard Handling**: Works with existing voicemail workflows
- **Transcription Available**: Full text visible in task attributes
- **Recording Playback**: Direct access to audio recording

## Technical Architecture

### Components

1. **voicemail-greeting.protected.js**
   - Handles initial greeting and recording
   - Creates Flex task for voicemail
   - Manages call flow and error handling

2. **send-voicemail-email.protected.js**
   - Triggered by transcription callback
   - Downloads and attaches recording
   - Sends branded HTML email via Mailgun
   - Updates task with transcription

### Environment Variables Required

```env
# Twilio Configuration
ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_FLEX_WORKSPACE_SID=WSxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Email Configuration  
ADMIN_EMAIL=admin@organization.com
MAILGUN_DOMAIN=mg.organization.com
MAILGUN_API_KEY=key-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Optional
VOICEMAIL_WORKFLOW_SID=WWxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Studio Flow Configuration

The feature can be used in two ways:

1. **Direct Function Call** (Recommended for pure voicemail)
   - Point phone number directly to `/voicemail-greeting`
   - Simpler setup, fewer moving parts

2. **Studio Flow Integration** (More flexibility)
   - Use Run Function widget to call voicemail-greeting
   - Allows for time-based routing or other logic

## Deployment Guide

### Step 1: Environment Setup

Update your `.env` file with all required variables:

```bash
cd serverless-functions
cp .env .env.backup  # Backup current config
```

Edit `.env` and ensure all variables are set correctly.

### Step 2: Deploy Functions

```bash
npm run deploy
```

Note the deployment URL (e.g., `custom-flex-extensions-serverless-1234-dev.twil.io`)

### Step 3: Create Studio Flow (Option A - Simple)

Create a JSON file `voicemail-only-flow.json`:

```json
{
  "description": "Voicemail Only Flow",
  "states": [
    {
      "name": "Trigger",
      "type": "trigger",
      "transitions": [
        {
          "event": "incomingCall",
          "next": "run_voicemail_function"
        }
      ],
      "properties": {}
    },
    {
      "name": "run_voicemail_function",
      "type": "run-function",
      "transitions": [
        {
          "event": "success",
          "next": "end_call"
        },
        {
          "event": "fail",
          "next": "error_handler"
        }
      ],
      "properties": {
        "service_sid": "ZSxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        "environment_sid": "ZExxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        "function_sid": "ZHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        "parameters": [
          {
            "key": "CallSid",
            "value": "{{trigger.call.CallSid}}"
          },
          {
            "key": "From",
            "value": "{{trigger.call.From}}"
          },
          {
            "key": "To",
            "value": "{{trigger.call.To}}"
          },
          {
            "key": "Called",
            "value": "{{trigger.call.Called}}"
          },
          {
            "key": "Caller",
            "value": "{{trigger.call.Caller}}"
          }
        ],
        "url": "https://YOUR-DOMAIN.twil.io/features/voicemail-only-with-email/voicemail-greeting"
      }
    },
    {
      "name": "error_handler",
      "type": "say-play",
      "transitions": [
        {
          "event": "audioComplete",
          "next": "end_call"
        }
      ],
      "properties": {
        "say": "We're sorry, but we're unable to take your message at this time. Please try again later.",
        "voice": "Polly.Joanna"
      }
    },
    {
      "name": "end_call",
      "type": "end-call",
      "transitions": [],
      "properties": {}
    }
  ],
  "initial_state": "Trigger",
  "flags": {
    "allow_concurrent_calls": true
  }
}
```

Deploy the flow:

```bash
twilio api:studio:v2:flows:create \
  --friendly-name "Voicemail Only Flow" \
  --status published \
  --definition "$(cat voicemail-only-flow.json)"
```

### Step 3: Create Studio Flow (Option B - Direct TwiML)

For the simplest setup, create a minimal flow that redirects to your function:

```json
{
  "description": "Voicemail Only Direct Flow",
  "states": [
    {
      "name": "Trigger",
      "type": "trigger",
      "transitions": [
        {
          "event": "incomingCall",
          "next": "redirect_to_function"
        }
      ],
      "properties": {}
    },
    {
      "name": "redirect_to_function",
      "type": "twiml-redirect",
      "transitions": [],
      "properties": {
        "method": "POST",
        "url": "https://YOUR-DOMAIN.twil.io/features/voicemail-only-with-email/voicemail-greeting"
      }
    }
  ],
  "initial_state": "Trigger",
  "flags": {
    "allow_concurrent_calls": true
  }
}
```

### Step 4: Configure Phone Number

1. Go to Twilio Console > Phone Numbers
2. Select the number to configure
3. In Voice Configuration:
   - Select "Webhook, TwiML Bin, Function, Studio Flow, Proxy Service"
   - Choose "Studio Flow"
   - Select your "Voicemail Only Flow"
4. Save the configuration

### Step 5: Test End-to-End

1. **Call the configured number**
2. **Leave a test voicemail**
3. **Verify**:
   - Task appears in Flex
   - Email received with attachment
   - Transcription updated in task
   - Audio file plays correctly

## Testing Checklist

- [ ] Short voicemail (< 10 seconds)
- [ ] Long voicemail (> 2 minutes)
- [ ] Press * to end recording
- [ ] Hang up to end recording
- [ ] Multiple admin emails (comma-separated)
- [ ] Special characters in transcription
- [ ] No speech (silence) handling
- [ ] Network timeout scenarios

## Monitoring & Troubleshooting

### Check Function Logs

```bash
# View recent executions
twilio serverless:logs --service-name YOUR-SERVICE

# Live tail logs
twilio serverless:logs --service-name YOUR-SERVICE --tail
```

### Common Issues

1. **"Environment variable validation failed"**
   - Check all required variables in .env
   - Ensure ADMIN_EMAIL is valid format
   - Verify MAILGUN_API_KEY is domain-specific

2. **Email not received**
   - Check Mailgun logs for delivery status
   - Verify domain DNS configuration
   - Test with single email first

3. **Task not created**
   - Verify TWILIO_FLEX_WORKSPACE_SID
   - Check workflow SID exists
   - Review function logs for errors

4. **No transcription**
   - Verify recording was successful
   - Check if caller spoke clearly
   - Review transcription callback logs

## Performance Considerations

- **Recording Limit**: 5 minutes maximum
- **File Size**: Emails with attachments > 20MB will include download link instead
- **Transcription**: May take 10-30 seconds after recording
- **Email Delivery**: Usually within 5 seconds of transcription

## Security Notes

- Functions use `.protected.js` for authentication
- Recording URLs require Twilio auth to access
- Email content sanitized to prevent injection
- No caller data stored outside of Twilio

## Customization Options

### Greeting Message
Edit in `voicemail-greeting.protected.js`:
```javascript
messages: {
  initialGreeting: 'Your custom greeting here...'
}
```

### Email Branding
Modify HTML template in `send-voicemail-email.protected.js`

### Voice Options
Change voice in `sayOptions`:
```javascript
sayOptions: { 
  voice: 'Polly.Matthew',  // Male voice
  language: 'en-GB'        // British accent
}
```

## Version History

- **1.0.0** - Initial release with core voicemail and email functionality
- Based on callback-and-voicemail-with-email feature
- Simplified for voicemail-only use case

## Support

For issues or questions:
1. Check function logs first
2. Review this README
3. Contact Twilio Support with error details