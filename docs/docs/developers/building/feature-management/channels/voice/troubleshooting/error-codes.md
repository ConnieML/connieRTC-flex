---
sidebar_label: Error Codes
sidebar_position: 2
title: "Voice Channel Error Codes"
---

# Voice Channel Error Codes

Comprehensive reference for diagnosing and fixing specific error codes in Connie's voice system.

## Twilio Platform Errors

### Call Connection Errors

#### Error 11200: HTTP Retrieval Failure
**Description**: Twilio couldn't reach your webhook URL

**Common Causes**:
- Webhook URL is incorrect or inaccessible
- SSL certificate issues
- Firewall blocking Twilio's requests
- Server overload or downtime

**Solutions**:
```bash
# Test webhook accessibility
curl -X POST "https://your-webhook-url.com/studio-flow" \
  -H "X-Twilio-Signature: test" \
  -d "From=+15551234567&To=+15559876543"

# Check SSL certificate
openssl s_client -connect your-domain.com:443 -servername your-domain.com

# Verify DNS resolution
nslookup your-domain.com
```

**Quick Fix**:
1. Go to Twilio Console > Phone Numbers
2. Update webhook URL with correct endpoint
3. Ensure URL uses HTTPS
4. Test the endpoint manually

#### Error 13224: Call Rejected
**Description**: The destination rejected the call

**Common Causes**:
- Called number is invalid or disconnected
- Carrier blocking the call
- Number formatting issues
- Do Not Call registry restrictions

**Solutions**:
```javascript
// Validate phone number format
const validatePhoneNumber = (number) => {
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  return e164Regex.test(number);
};

// Handle invalid numbers gracefully
if (!validatePhoneNumber(destinationNumber)) {
  console.error('Invalid phone number format:', destinationNumber);
  // Route to error handling
}
```

#### Error 20003: Authentication Failed
**Description**: Invalid Account SID or Auth Token

**Solutions**:
1. Verify Account SID and Auth Token in Twilio Console
2. Check environment variables are correctly set
3. Ensure no extra spaces or characters in credentials
4. Rotate Auth Token if compromised

```javascript
// Verify credentials
const accountSid = context.ACCOUNT_SID;
const authToken = context.AUTH_TOKEN;

console.log('Account SID:', accountSid?.substring(0, 10) + '...');
console.log('Auth Token exists:', !!authToken);
```

#### Error 21211: Invalid Phone Number
**Description**: Phone number is malformed or invalid

**Solutions**:
```javascript
// Proper phone number formatting
const formatPhoneNumber = (number) => {
  // Remove all non-digits
  const cleaned = number.replace(/\D/g, '');
  
  // Add country code if missing (US example)
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }
  
  // Add + if missing
  if (cleaned.length === 11 && !number.startsWith('+')) {
    return `+${cleaned}`;
  }
  
  return number;
};
```

### Studio Flow Errors

#### Error 30008: Unknown Application SID
**Description**: Studio Flow SID not found or inactive

**Solutions**:
1. Check Studio Flow exists and is published
2. Verify SID in phone number configuration
3. Ensure Flow hasn't been deleted
4. Check for typos in configuration

```bash
# Check Studio Flow status via CLI
twilio api:studio:v2:flows:list
twilio api:studio:v2:flows:fetch --sid FWXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

#### Flow Execution Failed
**Description**: Studio Flow encountered an unhandled error

**Common Widget Issues**:

**Function Widget Errors**:
```javascript
// Always handle errors in Function widgets
exports.handler = async (context, event, callback) => {
  try {
    // Your function logic here
    const result = await performOperation();
    callback(null, result);
  } catch (error) {
    console.error('Function error:', error);
    // Return error state for Flow to handle
    callback(null, { error: true, message: error.message });
  }
};
```

**HTTP Request Widget Timeouts**:
- Set appropriate timeout values (5-10 seconds)
- Implement error handling for failed requests
- Add retry logic for transient failures

**Split Widget Issues**:
- Ensure all possible paths have valid transitions
- Check for typos in condition variables
- Verify data types match expected conditions

### TaskRouter Errors

#### Error 20001: No Available Workers
**Description**: No agents available to handle the task

**Diagnostic Steps**:
1. Check agent availability in Flex interface
2. Verify agent skills match task requirements
3. Review agent capacity settings
4. Check activity states (Available vs Away)

**Solutions**:
```javascript
// Implement overflow routing
const createTask = async (attributes) => {
  try {
    const task = await client.taskrouter.workspaces(workspaceSid)
      .tasks.create({
        attributes: JSON.stringify(attributes),
        workflowSid: primaryWorkflowSid,
        timeout: 300 // 5 minutes
      });
    
    return task;
  } catch (error) {
    if (error.code === 20001) {
      // Route to overflow queue or voicemail
      return await createOverflowTask(attributes);
    }
    throw error;
  }
};
```

#### Task Creation Failed
**Description**: TaskRouter couldn't create the task

**Common Causes**:
- Invalid task attributes JSON
- Missing required workflow configuration
- Workspace limits exceeded
- Invalid queue or workflow SID

**Solutions**:
```javascript
// Validate task attributes before creation
const validateTaskAttributes = (attributes) => {
  try {
    JSON.parse(JSON.stringify(attributes));
    return true;
  } catch (error) {
    console.error('Invalid task attributes:', error);
    return false;
  }
};

// Sanitize attributes
const sanitizeAttributes = (attributes) => {
  const sanitized = {};
  for (const [key, value] of Object.entries(attributes)) {
    // Ensure all values are JSON-serializable
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      sanitized[key] = value;
    } else if (value && typeof value === 'object') {
      sanitized[key] = JSON.stringify(value);
    }
  }
  return sanitized;
};
```

## Add-On Specific Errors

### Email Notification Errors

#### SMTP Authentication Failed
**Error**: Email service rejected credentials

**Solutions**:
```javascript
// Test email configuration
const testEmailConfig = async () => {
  try {
    const testResult = await emailService.verify();
    console.log('Email service verified:', testResult);
  } catch (error) {
    console.error('Email config error:', error);
    // Check credentials, API keys, domain settings
  }
};
```

#### Email Delivery Failed
**Error**: Email sent but not delivered

**Diagnostic Checklist**:
- Check spam folder
- Verify recipient email address
- Review sender reputation
- Check SPF/DKIM records

```javascript
// Implement email delivery tracking
const sendEmailWithTracking = async (emailData) => {
  try {
    const result = await emailService.send(emailData);
    
    // Log successful send
    await logEmailDelivery({
      recipient: emailData.to,
      subject: emailData.subject,
      status: 'sent',
      message_id: result.messageId,
      timestamp: new Date()
    });
    
    return result;
  } catch (error) {
    // Log failed send
    await logEmailDelivery({
      recipient: emailData.to,
      subject: emailData.subject,
      status: 'failed',
      error: error.message,
      timestamp: new Date()
    });
    
    throw error;
  }
};
```

### Transcription Errors

#### Transcription Not Available
**Error**: Recording exists but no transcription

**Solutions**:
1. Check if transcription was enabled in recording settings
2. Verify transcription webhook URL
3. Review audio quality requirements
4. Check supported languages

```javascript
// Enable transcription in Studio Flow
const recordingConfig = {
  transcribe: true,
  transcription_callback: `https://${context.DOMAIN_NAME}/transcription-webhook`,
  max_length: 300,
  play_beep: true
};
```

#### Poor Transcription Quality
**Error**: Transcription text is garbled or incomplete

**Solutions**:
- Check audio quality (clear speech, minimal background noise)
- Verify correct language setting
- Consider custom vocabulary for domain-specific terms
- Review confidence scores

```javascript
// Post-process transcription for quality
const processTranscription = (transcriptionData) => {
  const { text, confidence } = transcriptionData;
  
  if (confidence < 0.6) {
    console.warn('Low confidence transcription:', confidence);
    // Flag for human review
    return {
      ...transcriptionData,
      needs_review: true,
      quality: 'low'
    };
  }
  
  return {
    ...transcriptionData,
    needs_review: false,
    quality: confidence > 0.8 ? 'high' : 'medium'
  };
};
```

### CRM Integration Errors

#### API Rate Limit Exceeded
**Error**: Too many API requests to CRM system

**Solutions**:
```javascript
// Implement rate limiting with exponential backoff
class RateLimitedAPI {
  constructor(maxRequests = 100, timeWindow = 3600000) { // 100 requests per hour
    this.requests = [];
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
  }
  
  async makeRequest(apiCall) {
    // Clean old requests
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.timeWindow);
    
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = Math.min(...this.requests);
      const waitTime = this.timeWindow - (now - oldestRequest);
      await this.sleep(waitTime);
    }
    
    this.requests.push(now);
    return await apiCall();
  }
  
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

#### CRM Data Not Found
**Error**: No matching record for phone number

**Solutions**:
```javascript
// Implement fuzzy matching for phone numbers
const normalizePhoneNumber = (phone) => {
  return phone.replace(/\D/g, ''); // Remove all non-digits
};

const findCRMContact = async (phoneNumber) => {
  const normalized = normalizePhoneNumber(phoneNumber);
  
  // Try exact match first
  let contact = await crm.findByPhone(phoneNumber);
  if (contact) return contact;
  
  // Try normalized match
  contact = await crm.findByPhone(`+1${normalized}`);
  if (contact) return contact;
  
  // Try without country code
  if (normalized.length === 11 && normalized.startsWith('1')) {
    contact = await crm.findByPhone(normalized.substring(1));
    if (contact) return contact;
  }
  
  return null;
};
```

## Debugging Strategies

### Logging Best Practices

```javascript
// Structured logging for better debugging
const logger = {
  info: (message, data = {}) => {
    console.log(JSON.stringify({
      level: 'INFO',
      timestamp: new Date().toISOString(),
      message,
      ...data
    }));
  },
  
  error: (message, error, data = {}) => {
    console.error(JSON.stringify({
      level: 'ERROR',
      timestamp: new Date().toISOString(),
      message,
      error: error.message,
      stack: error.stack,
      ...data
    }));
  },
  
  debug: (message, data = {}) => {
    console.log(JSON.stringify({
      level: 'DEBUG',
      timestamp: new Date().toISOString(),
      message,
      ...data
    }));
  }
};

// Usage in functions
exports.handler = async (context, event, callback) => {
  logger.info('Function started', { 
    from: event.From, 
    to: event.To,
    callSid: event.CallSid 
  });
  
  try {
    const result = await processCall(event);
    logger.info('Function completed successfully', { result });
    callback(null, result);
  } catch (error) {
    logger.error('Function failed', error, { 
      event: event,
      context: Object.keys(context) 
    });
    callback(error);
  }
};
```

### Error Monitoring Setup

```javascript
// Implement error tracking
const trackError = async (error, context) => {
  const errorData = {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    context: context,
    environment: process.env.NODE_ENV || 'development'
  };
  
  // Send to error tracking service
  try {
    await errorTrackingService.report(errorData);
  } catch (reportError) {
    console.error('Failed to report error:', reportError);
  }
  
  // Store locally for analysis
  await storeErrorLog(errorData);
};
```

### Health Check Implementation

```javascript
// Comprehensive health check
exports.healthCheck = async (context, event, callback) => {
  const healthStatus = {
    timestamp: new Date().toISOString(),
    services: {}
  };
  
  // Check database connection
  try {
    await testDatabaseConnection();
    healthStatus.services.database = { status: 'healthy' };
  } catch (error) {
    healthStatus.services.database = { 
      status: 'unhealthy', 
      error: error.message 
    };
  }
  
  // Check CRM API
  try {
    await testCRMConnection();
    healthStatus.services.crm = { status: 'healthy' };
  } catch (error) {
    healthStatus.services.crm = { 
      status: 'unhealthy', 
      error: error.message 
    };
  }
  
  // Check email service
  try {
    await testEmailService();
    healthStatus.services.email = { status: 'healthy' };
  } catch (error) {
    healthStatus.services.email = { 
      status: 'unhealthy', 
      error: error.message 
    };
  }
  
  // Overall health
  const allHealthy = Object.values(healthStatus.services)
    .every(service => service.status === 'healthy');
  
  healthStatus.overall = allHealthy ? 'healthy' : 'degraded';
  
  callback(null, healthStatus);
};
```

## Prevention and Monitoring

### Proactive Monitoring
- Set up alerts for error rate thresholds
- Monitor response times for external services
- Track call completion rates
- Monitor queue wait times

### Regular Health Checks
- Automated testing of critical workflows
- Validation of webhook endpoints
- Database connection monitoring
- API credential validation

### Capacity Planning
- Monitor concurrent call limits
- Track agent availability patterns
- Review queue capacity and overflow handling
- Plan for peak usage scenarios