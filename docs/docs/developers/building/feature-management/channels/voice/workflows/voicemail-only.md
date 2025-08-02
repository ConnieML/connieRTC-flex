---
sidebar_label: Direct to Voicemail Setup  
sidebar_position: 3
title: "Direct to Voicemail Workflow Setup"
---

# Direct to Voicemail Workflow Setup

The **Direct to Voicemail** workflow routes all calls immediately to a voicemail system - no agent queuing, no waiting, just straight to message recording.

## Caller Experience
- Caller dials your number
- Custom greeting plays immediately
- Caller records their message
- Call ends with confirmation
- Quick and simple interaction

## When to Use
- After-hours intake lines
- Message-only services
- High-volume screening applications
- Simple message collection systems
- Organizations with asynchronous service models

## Technical Implementation

### Studio Flow Configuration

This workflow uses the simplest possible Studio Flow:

1. **Incoming Call** → **Play Greeting** → **Record Message** → **Hang Up**
2. Optional: **Create Task** for agent follow-up
3. Optional: **Send Email** notification

### Required Components
- Basic Studio Flow (3-4 widgets maximum)
- Recording storage configuration
- Custom greeting audio file
- Optional: Task creation for follow-up

### Setup Steps

1. **Create Voicemail Greeting**
   - Record professional greeting message
   - Include instructions for leaving message
   - Upload to Twilio Assets or external hosting

2. **Configure Simple Studio Flow**
   ```
   Start → Play Greeting → Record Voicemail → [Optional: Create Task] → End
   ```

3. **Set Recording Parameters**
   ```json
   {
     "max_length": 300,
     "play_beep": true,
     "trim": "trim-silence",
     "transcribe": false
   }
   ```

4. **Optional: Task Creation**
   - Create Flex task for each voicemail
   - Include caller information and recording URL
   - Route to appropriate agent queue

## Recording Configuration

### Storage Options
- **Twilio Recordings**: Automatic storage in Twilio
- **External Storage**: Webhook to your system
- **Temporary**: Auto-delete after processing

### Quality Settings
- **Standard**: Good quality, smaller files
- **High**: Better quality, larger files
- **Custom**: Specific bitrate/format requirements

### Security Considerations
- Recording encryption at rest
- Access controls for playback
- Retention policies for compliance

## Advantages
- **Simplest Setup**: Minimal configuration required
- **Cost Effective**: No agent time for initial contact
- **Always Available**: 24/7 message collection
- **Scalable**: Handles unlimited concurrent calls
- **Fast**: No wait times for callers

## Limitations
- **No Real-time Support**: Callers can't speak to agents immediately
- **Follow-up Required**: All messages need agent review
- **Limited Interaction**: No complex call routing
- **Asynchronous Only**: No immediate problem resolution

## Adding Features

This workflow pairs well with these add-ons:
- [Email Notifications](../add-ons/email-notifications) - Immediate email alerts with recordings
- [Transcription](../add-ons/transcription) - Convert messages to text
- [Custom Greetings](../add-ons/custom-greetings) - Professional AI voices with business hours
- [Integrations](../add-ons/integrations) - Forward messages to external systems

## Advanced Configurations

### Business Hours Awareness
Add conditional logic for different greetings:
- **Business Hours**: "We're currently helping other callers..."
- **After Hours**: "Our office is currently closed..."
- **Holidays**: "We're closed for the holiday..."

### Department Routing
Even voicemail-only can route to different queues:
- **General**: Standard intake messages
- **Urgent**: High-priority routing for callbacks
- **Specific Services**: Departmental message handling

### Message Classification
Route different message types:
- **New Clients**: Intake queue
- **Existing Clients**: Account management
- **Emergencies**: Urgent notification system

## Migration Paths

### From Direct Workflows
- Redirect all calls to voicemail temporarily
- Maintain agent queues for gradual transition
- A/B test different approaches

### To Interactive Workflows
- Add menu options before voicemail
- Implement callback request system
- Gradually introduce agent availability

## Troubleshooting

### Common Issues
- **Recording not starting**: Check Play widget configuration and timing
- **Greeting not playing**: Verify audio file format and URL accessibility
- **Messages too short**: Adjust recording timeout and beep settings
- **Tasks not created**: Check TaskRouter configuration and webhook connectivity

### Audio Quality Issues
- **Poor recording quality**: Check network connection and audio settings
- **Greeting distorted**: Verify audio file format and bitrate
- **Silent recordings**: Check microphone permissions and connection

### Quick Fixes
- Test greeting playback from different devices
- Verify Studio Flow transitions between widgets
- Check Twilio Console for recording status
- Monitor webhook delivery for task creation

## Best Practices

### Greeting Message Content
- Keep under 30 seconds
- Clearly state organization name
- Provide expected callback timeframe
- Include alternative contact methods if urgent

### Follow-up Process
- Establish SLA for message response
- Create workflow for message prioritization
- Set up escalation for urgent messages
- Track response times and caller satisfaction