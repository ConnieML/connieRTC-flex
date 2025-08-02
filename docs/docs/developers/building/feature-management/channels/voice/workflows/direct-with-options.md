---
sidebar_label: Direct + Options Setup
sidebar_position: 2
title: "Direct + Options Workflow Setup"
---

# Direct + Options Workflow Setup

The **Direct + Options** workflow provides a full call center experience - calls ring to agents with hold music, and callers can press * for callback or voicemail options while waiting.

## Caller Experience
- Caller dials your number
- Call rings to available agents with hold music
- While waiting, caller can press * for options:
  - **Press 1**: Request callback (keeps place in line)
  - **Press 2**: Leave voicemail instead
  - **Stay on line**: Continue waiting for agent
- Professional call center experience

## When to Use
- Busy organizations with varying call volumes
- Professional service delivery requirements
- Need callback functionality during peak times
- Want full featured call center capabilities

## Technical Implementation

### Studio Flow Configuration

This workflow requires a more sophisticated Studio Flow:

1. **Incoming Call** → **Play Greeting** → **Queue with Options**
2. **While Queued**: Hold music + listen for * key
3. **Options Menu**: Route to callback or voicemail
4. **Callback**: Create task + disconnect gracefully
5. **Voicemail**: Record message + created task

### Required Components
- TaskRouter Queue with callback capabilities
- Advanced Studio Flow with Gather widgets
- Hold music assets
- Callback management system
- Voicemail recording capabilities

### Setup Steps

1. **Configure Enhanced TaskRouter Queue**
   ```json
   {
     "queue_name": "Support_With_Options",
     "target_workers": "routing.skills HAS 'support'",
     "max_reserved_workers": 3,
     "task_order": "FIFO"
   }
   ```

2. **Upload Hold Music**
   - Professional hold music file (MP3/WAV)
   - Upload to Twilio Assets or external hosting
   - Configure in Studio Flow

3. **Create Advanced Studio Flow**
   - Start: Trigger Widget
   - Greeting: Play welcome message
   - Queue: Send to TaskRouter with hold music
   - Gather: Listen for * key during hold
   - Options: Present callback/voicemail menu
   - Callback: Create task + polite disconnect
   - Voicemail: Record + create task

4. **Configure Callback Logic**
   - Create callback tasks in TaskRouter
   - Include original caller information
   - Set appropriate priority and routing

## Features Included

### Hold Music
- Professional audio during wait times
- Customizable music or messaging
- Seamless transition when agent answers

### Callback System
- Caller keeps place in line
- Agent receives callback task with context
- Reduces abandoned calls during busy periods

### Voicemail Option
- Alternative to waiting when time is limited
- Creates task for agent follow-up
- Includes recorded message

### Queue Management
- FIFO (First In, First Out) ordering
- Priority routing capabilities
- Real-time queue position updates

## Advantages
- **Professional**: Full call center experience
- **Flexible**: Multiple options for callers
- **Scalable**: Handles varying call volumes
- **Efficient**: Reduces abandoned calls

## Implementation Complexity
- **Medium to High**: Requires multiple components
- **Testing Required**: More scenarios to validate
- **Maintenance**: Additional systems to monitor

## Adding Features

This workflow supports all add-ons:
- [Email Notifications](../add-ons/email-notifications) - Email alerts for voicemails/callbacks
- [IVR Functions](../add-ons/ivr-functions) - Advanced menu systems
- [Custom Greetings](../add-ons/custom-greetings) - Professional voice prompts
- [Transcription](../add-ons/transcription) - Voicemail speech-to-text
- [Integrations](../add-ons/integrations) - CRM lookup and data enrichment

## Migration Paths

### From Direct Workflow
- Add hold music and options menu
- Implement callback system
- Test queue management

### To Advanced Features
- Add department routing (IVR)
- Implement skill-based routing
- Add business hours handling

## Troubleshooting

### Common Issues
- **Hold music not playing**: Check audio file format and Studio Flow configuration
- **Options menu not working**: Verify Gather widget timeout and key detection
- **Callback tasks not created**: Check TaskRouter configuration and serverless functions
- **Queue position not updating**: Verify TaskRouter webhook configuration

### Performance Optimization
- Monitor queue wait times
- Adjust agent capacity settings
- Optimize hold music file size
- Review callback success rates

### Quick Fixes
- Restart Studio Flow if widgets hang
- Check Twilio Console for error logs
- Verify all webhook endpoints are responding
- Test individual flow components separately