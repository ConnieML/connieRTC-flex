---
sidebar_label: Direct Setup
sidebar_position: 1
title: "Direct Workflow Setup"
---

# Direct Workflow Setup

The **Direct** workflow is the simplest voice setup - calls ring directly to available agents with no waiting or menu options.

## Caller Experience
- Caller dials your number
- If agents are available: call rings immediately
- If no agents: caller gets busy signal or standard message
- Clean, simple interaction

## When to Use
- Small organizations with consistent staffing
- Simple contact center needs
- Quick setup for proof-of-concepts
- Organizations that prefer straightforward call handling

## Technical Implementation

### Studio Flow Configuration

This workflow requires minimal Studio Flow setup:

1. **Incoming Call** → **Check Agent Availability** → **Ring Agent**
2. If no agents available → **Play Busy Message** → **Hang Up**

### Required Components
- TaskRouter Queue configured for your agents
- Basic Studio Flow (minimal widgets)
- Agent profiles with appropriate skills

### Setup Steps

1. **Configure TaskRouter Queue**
   ```json
   {
     "queue_name": "Direct_Support",
     "target_workers": "routing.skills HAS 'support'",
     "max_reserved_workers": 1
   }
   ```

2. **Create Basic Studio Flow**
   - Start: Trigger Widget
   - Queue: Send to TaskRouter Queue
   - End: Handle unavailable scenarios

3. **Test the Flow**
   - Verify agent receives calls immediately
   - Test busy/unavailable scenarios

## Advantages
- **Simple**: Minimal configuration required
- **Fast**: No menu navigation or waiting
- **Reliable**: Fewer components to break
- **Cost-effective**: Uses minimal Twilio resources

## Limitations
- No callback options for busy periods
- No voicemail capabilities (unless added as add-on)
- Limited call routing flexibility
- No hold music or queue management

## Adding Features

This workflow can be enhanced with add-ons:
- [Email Notifications](../add-ons/email-notifications) - For missed call alerts
- [Custom Greetings](../add-ons/custom-greetings) - Professional welcome messages
- [Integrations](../add-ons/integrations) - CRM data with incoming calls

## Migration Path

To upgrade from Direct to more advanced workflows:
- **Direct + Options**: Add callback and voicemail during wait times
- **Direct to Voicemail**: Route all calls to message-taking system

## Troubleshooting

### Common Issues
- **Agents not receiving calls**: Check TaskRouter queue configuration
- **All calls going to busy**: Verify agent availability and status
- **No ring tone**: Check Studio Flow routing logic

### Quick Fixes
- Restart agent sessions in Flex
- Verify phone number configuration
- Check TaskRouter activity status