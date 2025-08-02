---
sidebar_label: Common Issues
sidebar_position: 1
title: "Voice Channel Troubleshooting"
---

# Voice Channel Troubleshooting

:::danger 🚨 EMERGENCY: Voice System Down?
**START HERE - Check Function Logs First:**

```bash
twilio serverless:logs --service-sid ZS906734499c94e8fb7c2eca7c708f8f6b --tail
```

**This command shows the REAL errors behind generic Studio Flow failures!**

- **Error 81014** = Function crashed, check logs for JavaScript errors
- **404 errors** = Missing recordings or wrong URLs  
- **Silent failures** = Function ran but hit internal errors

**Most voice issues are solved by reading these logs first!**
:::

Quick solutions for common issues with Connie's voice workflows and add-ons.

## Quick Diagnostic Checklist

### 🔍 Before You Start
1. **Check Twilio Console** - Look for error messages or failed calls
2. **Verify Phone Number** - Ensure the number is configured and active
3. **Test Basic Connectivity** - Can you make a test call?
4. **Review Recent Changes** - What was modified before the issue started?

### 📞 Call Flow Issues

#### Direct Workflow Issues {#direct}
**Common Issues with Direct Workflow**:
- Agents not receiving calls despite being available
- Calls dropping after connection
- Multiple agents picking up same call

**Quick Solutions**:
- Verify agent skills match queue configuration
- Check TaskRouter worker capacity settings  
- Review agent availability status in Flex

#### Direct Plus Workflow Issues {#direct-plus}
**Common Issues with Direct + Options Workflow**:
- Hold options (* key) not working
- Callback requests not being processed
- Hold music not playing during wait

**Quick Solutions**:
- Test DTMF key detection in Studio Flow
- Verify callback webhook configuration
- Check hold music file URL and format

#### Calls Not Connecting
**Symptoms**: Callers get busy signal or "number not in service"

**Quick Fixes**:
- Verify phone number webhook URL is correct
- Check Studio Flow is published and active
- Confirm phone number points to the right Studio Flow
- Test webhook URL accessibility from external network

**Diagnostic Steps**:
```bash
# Test webhook URL
curl -X POST "https://your-webhook-url.com/studio-flow" \
  -d "From=+15551234567&To=+15559876543"

# Check Studio Flow status
# Go to Twilio Console > Studio > Your Flow > Check "Published" status
```

#### Agents Not Receiving Calls  
**Symptoms**: Studio Flow works but calls don't reach agents

**Quick Fixes**:
- Check agent availability in Flex (Available vs Away status)
- Verify TaskRouter queue configuration
- Confirm agent skills match queue requirements
- Restart agent browser/Flex session

**Diagnostic Steps**:
1. Go to Twilio Console > TaskRouter > Queues
2. Check queue statistics - are tasks being created?
3. Go to Workers - are agents showing as Available?
4. Check Activity settings - is agent's current activity accepting tasks?

#### Hold Music Not Playing
**Symptoms**: Callers hear silence while waiting

**Quick Fixes**:
- Verify hold music file URL is accessible
- Check audio file format (MP3, WAV supported)
- Confirm Studio Flow has correct "Play" widget configuration
- Test audio file directly in browser

**Audio File Requirements**:
- Format: MP3 or WAV
- Sample Rate: 8kHz (recommended for telephony)
- Bit Rate: 64kbps or lower
- Duration: 30 seconds to 5 minutes
- File size: Under 5MB

### 🎙️ Voicemail Issues

#### Voicemails Not Recording
**Symptoms**: Callers can't leave messages or recordings are empty

**Quick Fixes**:
- Check Studio Flow "Record" widget configuration
- Verify recording timeout settings (not too short)
- Confirm "Play Beep" is enabled
- Test with different phone types (mobile, landline)

**Recording Widget Settings**:
```json
{
  "max_length": 300,
  "play_beep": true,
  "trim": "trim-silence",
  "timeout": 5,
  "finish_on_key": "#"
}
```

#### Email Notifications Not Sending
**Symptoms**: Voicemails recorded but no email alerts

**Quick Fixes**:
- Check email service API credentials
- Verify webhook URLs are accessible
- Review serverless function logs for errors
- Test email service separately

**Debug Email Function**:
```javascript
// Add logging to your email function
console.log('Email function triggered:', {
  from: event.From,
  recording_url: event.RecordingUrl,
  email_recipient: context.NOTIFICATION_EMAIL
});
```

### 🔧 Add-On Specific Issues

#### Transcription Not Working
**Symptoms**: Voicemails recorded but no transcription text

**Quick Fixes**:
- Verify transcription is enabled in recording settings
- Check transcription webhook URL
- Confirm language settings match caller language
- Review audio quality (clear speech needed)

**Transcription Settings**:
```json
{
  "transcribe": true,
  "transcription_callback": "https://your-domain/transcription-webhook"
}
```

#### CRM Integration Failures
**Symptoms**: Agent screens empty or caller info not loading

**Quick Fixes**:
- Test CRM API credentials separately
- Check network connectivity to CRM service
- Verify caller phone number format matches CRM
- Review API rate limits and quotas

**CRM Debug Test**:
```javascript
// Test CRM connection
const testCRMConnection = async () => {
  try {
    const response = await fetch('https://api.crm.com/test', {
      headers: { 'Authorization': `Bearer ${context.CRM_TOKEN}` }
    });
    console.log('CRM Status:', response.status);
  } catch (error) {
    console.error('CRM Connection Failed:', error);
  }
};
```

#### IVR Menus Not Responding
**Symptoms**: Callers press keys but nothing happens

**Quick Fixes**:
- Check "Gather" widget timeout settings
- Verify key press detection configuration
- Test with different phone types
- Review Studio Flow transitions

**Gather Widget Settings**:
```json
{
  "timeout": 10,
  "num_digits": 1,
  "finish_on_key": "",
  "input": "dtmf"
}
```

## Performance Issues

### High Latency
**Symptoms**: Delays in call routing, slow response times

**Common Causes & Solutions**:
- **External API calls taking too long**
  - Implement timeout limits (3-5 seconds max)
  - Add caching for frequently accessed data
  - Use parallel processing where possible

- **Database queries slow**
  - Add database indexes for phone number lookups
  - Use connection pooling
  - Cache query results

- **Large audio files**
  - Compress audio files appropriately
  - Use CDN for audio asset delivery
  - Consider shorter hold music loops

### Memory/Resource Issues
**Symptoms**: Functions timing out, intermittent failures

**Solutions**:
- Monitor serverless function memory usage
- Optimize database connections
- Implement proper error handling and retries
- Use streaming for large data processing

## Error Code Reference

### Common Twilio Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| **81014** | **Function execution error** | **🚨 CRITICAL: Check serverless logs immediately! See emergency section above** |
| 11200 | HTTP retrieval failure | Check webhook URL accessibility |
| 13224 | Call rejected | Verify phone number and routing |
| 20003 | Authentication failed | Check account credentials |
| 21211 | Invalid phone number | Verify number format |
| 30008 | Unknown application SID | Check Studio Flow configuration |

:::warning Error 81014 - Function Execution Failed
**This is the most common cause of voice system failures!**

When you see Error 81014 in Studio Flow:
1. **IMMEDIATELY run the function logs command** from the emergency section above
2. Look for JavaScript errors, timeouts, or unhandled exceptions
3. Check for missing environment variables or API credentials
4. Verify all external API endpoints are accessible

**The Studio Flow error message is generic - the real error is in the function logs!**
:::

### Studio Flow Errors

| Error | Description | Solution |
|-------|-------------|----------|
| Flow execution failed | Studio Flow encountered an error | Check Flow logic and widget configuration |
| Widget timeout | Widget didn't receive expected input | Adjust timeout settings |
| Webhook error | External webhook returned error | Verify webhook endpoint and response format |

### TaskRouter Errors

| Error | Description | Solution |
|-------|-------------|----------|
| No available workers | No agents to handle the task | Check agent availability and skills |
| Queue full | Task queue at capacity | Review queue limits and agent capacity |
| Task timeout | Task waited too long for agent | Adjust task timeout or add more agents |

## Debugging Tools

### Twilio Console Monitoring
1. **🚨 FUNCTION LOGS (MOST IMPORTANT)**: Use CLI command from emergency section above
2. **Call Logs**: Console > Monitor > Logs > Calls
3. **Studio Flow Execution**: Console > Studio > Your Flow > Execution History
4. **TaskRouter Stats**: Console > TaskRouter > Queues/Workers
5. **Serverless Logs**: Console > Functions > Your Function > Logs (slower than CLI)

:::tip Pro Tip: CLI vs Console Logs
The `twilio serverless:logs` CLI command is MUCH faster than the Console for real-time debugging. Use CLI during emergencies!
:::

### Testing Commands
```bash
# Test webhook endpoint
curl -X POST "https://your-webhook.com/endpoint" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "From=+15551234567&To=+15559876543&CallSid=test123"

# Test audio file accessibility
curl -I "https://your-domain.com/assets/hold-music.mp3"

# Check DNS resolution
nslookup your-webhook-domain.com
```

### Log Analysis
```javascript
// Add structured logging to your functions
const logEvent = (event_type, data) => {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    event_type: event_type,
    ...data
  }));
};

// Usage
logEvent('call_received', { from: event.From, to: event.To });
logEvent('crm_lookup', { phone: event.From, found: !!crmData });
```

## Prevention Best Practices

### Regular Health Checks
```javascript
// Implement health check endpoints
exports.healthCheck = async (context, event, callback) => {
  const checks = await Promise.allSettled([
    testDatabaseConnection(),
    testCRMConnection(),
    testEmailService(),
    testAudioAssets()
  ]);
  
  const results = checks.map((check, index) => ({
    service: ['database', 'crm', 'email', 'audio'][index],
    status: check.status === 'fulfilled' ? 'healthy' : 'error',
    error: check.reason?.message
  }));
  
  callback(null, { health_checks: results });
};
```

### Monitoring and Alerting
- Set up alerts for failed calls above threshold
- Monitor response times for external integrations
- Track email delivery success rates
- Alert on high error rates in Studio Flows

### Regular Maintenance
- Review and update phone number configurations
- Test all workflows monthly
- Update API credentials before expiration
- Clean up old recordings and logs
- Review and optimize database indexes

## Getting Help

### Internal Resources
1. Check [Error Codes](./error-codes) for specific error solutions
2. Review [Voice Overview](../overview.md) for architecture understanding
3. Check specific add-on documentation for detailed troubleshooting

### External Support
1. **Twilio Support**: For platform-specific issues
2. **CRM Vendor Support**: For integration problems
3. **DNS/Hosting Provider**: For webhook accessibility issues

### Emergency Procedures
1. **Service Outage**: Switch to backup phone number or emergency routing
2. **Critical Bugs**: Disable problematic features and route to basic workflow
3. **Security Issues**: Immediately revoke API keys and review access logs