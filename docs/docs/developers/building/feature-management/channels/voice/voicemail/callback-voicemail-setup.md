---
sidebar_label: Callback + Voicemail Setup  
sidebar_position: 6
title: "Option B: Callback + Voicemail Setup"
---

# Option B: Callback + Voicemail Setup

This guide shows you how to implement the professional callback and voicemail experience using the ConnieRTC template features.

:::info Standard Template Feature
This setup uses the standard `callback-and-voicemail` template feature that's included in ConnieRTC. No additional development required.
:::

## Configuration

Enable the full callback and voicemail experience:

```json
{
  "features": {
    "callback_and_voicemail": {
      "enabled": true,
      "allow_requeue": true,
      "max_attempts": 3,
      "auto_select_task": false
    }
  }
}
```

## Deployment

```bash
# Deploy serverless functions
cd serverless-functions && npm run deploy

# Apply infrastructure changes  
cd infra-as-code/terraform/environments/default
terraform apply -var-file="local.tfvars"
```

## What This Provides

- Professional in-queue experience with hold music
- Callers can press * anytime for callback or voicemail options
- Maintains caller's place in queue for callbacks
- Voicemail tasks appear in Flex for agent handling

## Next Steps

For email notifications with voicemail recordings, upgrade to:
- [Email-Enabled Voicemail](./email-providers/mailgun-setup) - Full email integration