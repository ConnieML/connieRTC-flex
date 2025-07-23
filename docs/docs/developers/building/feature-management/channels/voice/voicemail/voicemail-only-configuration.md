---
sidebar_label: Voicemail-Only Configuration
sidebar_position: 3
title: "Configuring Voicemail-Only Lines"
---

# Voicemail-Only Line Configuration

This guide explains how to configure a dedicated voicemail-only line using the existing `callback-and-voicemail-with-email` feature without modifying core functionality.

:::info Production-Safe Implementation
This configuration uses a special parameter to enable voicemail-only mode. Without this parameter, the function behaves exactly as before, ensuring zero impact on existing deployments.
:::

## Overview

Some organizations need dedicated voicemail lines that:
- Skip all callback and hold options
- Direct callers immediately to voicemail recording
- Still create Flex tasks and send email notifications
- Use the same infrastructure as regular lines

## Implementation

### Step 1: Studio Flow Configuration

In your Studio Flow for the voicemail-only number:

1. **Add a Say/Play Widget** (optional)
   - Welcome message: "Thank you for calling [Organization]. Please leave your message after the tone."
   
2. **Configure Send to Flex Widget**
   - **Hold Music TwiML URL**: Add the `voicemailOnly=true` parameter
   ```
   https://[YOUR-DOMAIN]/features/callback-and-voicemail-with-email/studio/wait-experience?voicemailOnly=true
   ```
   - **Workflow**: Use the same workflow SID as your regular lines
   - **Task Channel**: voice
   - **Attributes**: Standard attributes

### Step 2: How It Works

When `voicemailOnly=true` is passed:

1. **Skips** all callback and hold queue logic
2. **Immediately prompts** for voicemail recording
3. **Creates Flex task** with voicemail attributes
4. **Sends email** to configured admins
5. **Uses same workflow** and routing as regular voicemails

### Step 3: Testing

1. **Deploy** your serverless functions (no code changes needed)
2. **Update** your Studio Flow with the voicemailOnly parameter
3. **Call** the dedicated voicemail number
4. **Verify**:
   - No callback or hold options offered
   - Direct to voicemail recording
   - Task appears in Flex
   - Email notification sent

## Technical Details

### Parameter Flow

The `voicemailOnly=true` parameter is passed through all recording callbacks:
- Initial wait experience URL
- Recording action URL
- Transcription callback URL
- Submit voicemail URL

### Function Behavior

```javascript
// In wait-experience.protected.js
if (voicemailOnly === 'true' && (mode === 'initialize' || mode === undefined)) {
  // Skip queue lookup and redirect directly to voicemail recording
  twiml.redirect(`${baseUrl}?mode=record-voicemail&CallSid=${CallSid}&enqueuedTaskSid=${voicemailOnlyTaskSid}&voicemailOnly=true`);
  return callback(null, twiml);
}
```

### Email Configuration

- **Same Mailgun setup** as regular lines
- **Same admin email list**
- **Same email template** (shows different originating number)
- **No additional configuration needed**

## Rollback Plan

If any issues occur:

### Option 1: Remove Parameter (Instant)
1. Edit Studio Flow
2. Remove `?voicemailOnly=true` from the wait URL
3. Save - reverts to normal callback/voicemail behavior

### Option 2: Restore Original Function
```bash
# If you backed up the original function
cp wait-experience.protected.js.backup wait-experience.protected.js
npm run deploy
```

## Multiple Voicemail-Only Lines

To add more voicemail-only numbers:

1. Create new Studio Flow for each number
2. Add the same `voicemailOnly=true` parameter
3. Use the same serverless deployment
4. All lines share the same email configuration

## Troubleshooting

### Caller Still Gets Hold Options
- **Check**: Parameter is exactly `voicemailOnly=true` (case-sensitive)
- **Verify**: URL includes the parameter after `?`
- **Confirm**: Using correct serverless domain

### No Email Sent
- Same troubleshooting as regular voicemail emails
- Check Mailgun logs
- Verify environment variables

### Task Not Created
- Check Twilio Function logs for errors
- Verify workflow SID is correct
- Ensure TaskRouter workspace is active

## Best Practices

1. **Test thoroughly** before deploying to production
2. **Document** which numbers are voicemail-only
3. **Monitor** function logs during initial deployment
4. **Keep IVR logic** in Studio Flow for easy updates
5. **Use descriptive names** for voicemail-only Studio Flows

## Example Configuration

**Phone Number**: +1-725-444-5259
**Studio Flow**: "H2H Voicemail Only Flow"
**Wait URL**: 
```
https://custom-flex-extensions-serverless-4044-dev.twil.io/features/callback-and-voicemail-with-email/studio/wait-experience?voicemailOnly=true
```
**Result**: Callers hear greeting → record message → task created → email sent

---

This configuration allows unlimited voicemail-only lines without code duplication or maintenance overhead.