---
sidebar_label: "Debugging Best Practices"
sidebar_position: 2
title: "Connie Debugging Best Practices & Emergency Response"
---

# Connie Debugging Best Practices & Emergency Response

## Overview

This guide provides comprehensive debugging strategies specifically for Connie serverless functions and features. Following these practices will prevent debugging emergencies and enable rapid resolution when issues occur.

## Emergency Response Protocol

### 🚨 When Connie Features Break in Production

**Step 1: Immediate Diagnostics (First 2 minutes)**
```bash
# Primary diagnostic tool - START HERE
twilio serverless:logs --service-sid ZS906734499c94e8fb7c2eca7c708f8f6b --tail

# Check recent call activity
twilio api:core:calls:list --limit 5 --status failed
```

**Step 2: Function-Specific Investigation**
```bash
# Get recent function executions
twilio serverless:logs --service-sid ZS906734499c94e8fb7c2eca7c708f8f6b --function-sid [FUNCTION_SID] --limit 20

# Check specific function health
curl -X POST https://[DEPLOYMENT_DOMAIN]/[FUNCTION_PATH] \
  -d "CallSid=test&mode=debug" \
  -H "Content-Type: application/x-www-form-urlencoded"
```

**Step 3: Studio Flow Analysis**
```bash
# Check flow executions
twilio api:studio:v2:flows:executions:list --flow-sid [FLOW_SID] --limit 10

# Get execution details
twilio api:studio:v2:flows:executions:fetch --flow-sid [FLOW_SID] --sid [EXECUTION_SID]
```

## Mandatory Logging Standards

### Required Logging Pattern for ALL Functions

Every Connie serverless function MUST implement this logging pattern:

```javascript
exports.handler = async function(context, event, callback) {
  // 1. ENTRY LOGGING (Always include)
  console.log('=== [FUNCTION_NAME] DEBUG START ===');
  console.log('Event parameters:', JSON.stringify(event, null, 2));
  console.log('Context domain:', context.DOMAIN_NAME);
  console.log('Timestamp:', new Date().toISOString());
  
  try {
    // 2. PARAMETER VALIDATION LOGGING
    console.log('Validating required parameters...');
    const requiredParams = ['CallSid', 'From', 'To'];
    for (const param of requiredParams) {
      if (!event[param]) {
        console.error(`VALIDATION ERROR: Missing ${param}`);
        return callback(new Error(`Missing required parameter: ${param}`));
      }
    }
    console.log('Parameter validation passed');
    
    // 3. BUSINESS LOGIC LOGGING
    console.log('Processing mode:', event.mode || 'initial');
    console.log('Caller info:', { from: event.From, to: event.To, callSid: event.CallSid });
    
    // 4. EXTERNAL API LOGGING (if applicable)
    if (makingAPICall) {
      console.log('Making API call to:', apiUrl);
      console.log('API request headers:', headers);
      // Log response when received
      console.log('API response status:', response.status);
      console.log('API response data:', response.data);
    }
    
    // 5. WORKFLOW/QUEUE LOGGING (if applicable)
    if (workflowSid) {
      console.log('Using workflow SID:', workflowSid);
      console.log('Task attributes:', JSON.stringify(taskAttributes, null, 2));
    }
    
    // Your function logic here...
    
    // 6. SUCCESS LOGGING
    console.log('Function completed successfully');
    console.log('Result:', JSON.stringify(result, null, 2));
    console.log('=== [FUNCTION_NAME] DEBUG END ===');
    return callback(null, result);
    
  } catch (error) {
    // 7. ERROR LOGGING (Critical!)
    console.error('=== [FUNCTION_NAME] ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Event data:', JSON.stringify(event, null, 2));
    console.error('Context data:', JSON.stringify({
      domain: context.DOMAIN_NAME,
      accountSid: context.ACCOUNT_SID,
      timestamp: new Date().toISOString()
    }, null, 2));
    console.error('=== ERROR END ===');
    
    return callback(error);
  }
};
```

### Logging Standards by Function Type

#### Voice Functions
```javascript
// TwiML generation logging
console.log('Generating TwiML response...');
const twiml = new Twilio.twiml.VoiceResponse();
console.log('TwiML before modifications:', twiml.toString());

// Studio Flow transition logging
console.log('Studio Flow transition:', {
  flowSid: event.FlowSid,
  executionSid: event.ExecutionSid,
  stepSid: event.StepSid
});

// Queue/Workflow logging
console.log('TaskRouter configuration:', {
  workspaceSid: context.TWILIO_FLEX_WORKSPACE_SID,
  workflowSid: enqueuedWorkflowSid,
  queueName: queueName
});
```

#### Email Functions
```javascript
// Mailgun API logging
console.log('Mailgun API request:', {
  url: `https://api.mailgun.net/v3/${context.MAILGUN_DOMAIN}/messages`,
  domain: context.MAILGUN_DOMAIN,
  recipients: recipients,
  subject: subject
});

// Email delivery logging
console.log('Email sent successfully:', {
  messageId: response.id,
  message: response.message,
  recipients: recipients.length
});

// Attachment processing logging
if (attachments.length > 0) {
  console.log('Processing attachments:', attachments.map(a => ({
    filename: a.filename,
    size: a.size,
    contentType: a.contentType
  })));
}
```

#### API Integration Functions
```javascript
// External API call logging
console.log('External API call initiated:', {
  method: 'POST',
  url: apiEndpoint,
  headers: sanitizedHeaders, // Remove sensitive data
  requestSize: JSON.stringify(requestBody).length
});

// Authentication logging
console.log('API authentication status:', {
  authenticated: !!authToken,
  tokenType: 'Bearer',
  expiresAt: tokenExpiry
});

// Response analysis logging
console.log('API response analysis:', {
  status: response.status,
  contentType: response.headers['content-type'],
  responseSize: response.data ? JSON.stringify(response.data).length : 0,
  successful: response.status >= 200 && response.status < 300
});
```

## Environment-Specific Logging

### Development vs Production Logging

```javascript
// Use environment variables to control verbosity
const isLocalDev = context.ENABLE_LOCAL_LOGGING === 'true';
const isDebugMode = context.DEBUG_MODE === 'true';

// Verbose logging for development
if (isLocalDev) {
  console.log('VERBOSE: Detailed parameter analysis...', {
    eventKeys: Object.keys(event),
    contextKeys: Object.keys(context),
    memoryUsage: process.memoryUsage()
  });
}

// Debug mode for specific troubleshooting
if (isDebugMode) {
  console.log('DEBUG: Deep function analysis...', {
    functionName: context.FUNCTION_NAME,
    functionVersion: context.FUNCTION_VERSION,
    executionEnvironment: context.EXECUTION_ENVIRONMENT
  });
}

// Always log critical events regardless of environment
console.log('CRITICAL: Task creation result:', {
  taskSid: task.sid,
  queueSid: task.queueSid,
  workflowSid: task.workflowSid,
  attributes: task.attributes
});
```

## Diagnostic Commands Reference

### Essential Twilio CLI Commands

```bash
# Real-time function logs (PRIMARY DIAGNOSTIC TOOL)
twilio serverless:logs --service-sid ZS906734499c94e8fb7c2eca7c708f8f6b --tail

# Function-specific logs
twilio serverless:logs --service-sid ZS906734499c94e8fb7c2eca7c708f8f6b --function-sid [FUNCTION_SID]

# Studio Flow execution analysis
twilio api:studio:v2:flows:executions:list --flow-sid [FLOW_SID] --limit 10

# Recent call analysis
twilio api:core:calls:list --limit 10 --status completed
twilio api:core:calls:list --limit 10 --status failed

# TaskRouter debugging
twilio api:taskrouter:v1:workspaces:tasks:list --workspace-sid WS7d3bcedb08a791b201aa4ec4fdadcfe6 --limit 10
twilio api:taskrouter:v1:workspaces:workflows:list --workspace-sid WS7d3bcedb08a791b201aa4ec4fdadcfe6

# Account activity overview
twilio api:core:accounts:fetch --sid [ACCOUNT_SID]
```

### Advanced Debugging Commands

```bash
# Specific call investigation
twilio api:core:calls:fetch --sid [CALL_SID]
twilio api:core:calls:recordings:list --call-sid [CALL_SID]

# Studio Flow deep dive
twilio api:studio:v2:flows:executions:steps:list --flow-sid [FLOW_SID] --execution-sid [EXECUTION_SID]

# TaskRouter task details
twilio api:taskrouter:v1:workspaces:tasks:fetch --workspace-sid [WORKSPACE_SID] --sid [TASK_SID]

# Function deployment verification
twilio serverless:functions:list --service-sid ZS906734499c94e8fb7c2eca7c708f8f6b
twilio serverless:environments:list --service-sid ZS906734499c94e8fb7c2eca7c708f8f6b
```

## Testing & Validation

### Pre-Deployment Testing Checklist

Before deploying ANY Connie feature:

- [ ] **Entry/exit logging present** - Function logs start and completion
- [ ] **Error handling with full context** - Comprehensive error logging
- [ ] **Parameter validation with logging** - Log all validation steps
- [ ] **Business logic steps logged** - Key decision points logged
- [ ] **External API calls logged** - Full request/response logging
- [ ] **Success/failure states logged** - Clear outcome logging
- [ ] **Environment variables validated** - Required config present
- [ ] **Function responds to test calls** - Basic functionality verified

### Local Testing Commands

```bash
# Test function locally
cd serverless-functions
npm run start

# Test specific function endpoint
curl -X POST http://localhost:3001/features/[FEATURE_NAME]/[FUNCTION_NAME] \
  -d "CallSid=test&From=%2B15551234567&To=%2B15559876543" \
  -H "Content-Type: application/x-www-form-urlencoded"

# Test with debug parameters
curl -X POST http://localhost:3001/features/[FEATURE_NAME]/[FUNCTION_NAME] \
  -d "CallSid=test&mode=debug&ENABLE_LOCAL_LOGGING=true" \
  -H "Content-Type: application/x-www-form-urlencoded"
```

## Common Debugging Scenarios

### Scenario 1: "Option not available at this time"

**Symptoms**: Callers hear this message when trying to use voicemail or callback features

**Investigation Steps**:
1. Check workflow SID configuration in Studio Flow
2. Verify workflow exists and is active
3. Check function logs for workflow lookup errors
4. Validate TaskRouter workspace configuration

**Common Causes**:
- Hardcoded workflow SID in wrong environment
- Workflow disabled or deleted
- Queue configuration mismatch

### Scenario 2: Email notifications not sending

**Symptoms**: Voicemails recorded but no email notifications sent

**Investigation Steps**:
1. Check Mailgun API credentials and domain configuration
2. Verify function logs for email sending attempts
3. Test Mailgun API independently
4. Check email attachment processing

**Common Causes**:
- Wrong Mailgun API key (private vs domain-specific)
- Domain not verified in Mailgun
- Attachment size limits exceeded

### Scenario 3: Studio Flow not executing

**Symptoms**: Calls not reaching Flex or functions

**Investigation Steps**:
1. Verify phone number webhook configuration
2. Check Studio Flow publication status
3. Review Flow execution logs
4. Validate webhook URL format

**Common Causes**:
- Phone number not configured with Studio Flow
- Flow in draft status, not published
- Invalid webhook URLs in Flow widgets

## Performance Monitoring

### Key Metrics to Monitor

```javascript
// Function execution timing
const startTime = Date.now();
// ... function logic ...
const executionTime = Date.now() - startTime;
console.log('Function execution time:', executionTime, 'ms');

// Memory usage monitoring
console.log('Memory usage:', process.memoryUsage());

// API response time tracking
const apiStartTime = Date.now();
const response = await apiCall();
const apiResponseTime = Date.now() - apiStartTime;
console.log('API response time:', apiResponseTime, 'ms');
```

### Alert Thresholds

Set up monitoring for:
- Function execution time > 10 seconds
- Memory usage > 80% of limit
- API response time > 5 seconds
- Error rate > 5% over 10 minutes

## Documentation Standards

### Function Documentation Template

```javascript
/**
 * FUNCTION: [Function Name]
 * PURPOSE: [What this function does]
 * TRIGGER: [How this function is called]
 * 
 * REQUIRED PARAMETERS:
 * - CallSid: Twilio call identifier
 * - From: Caller phone number
 * - To: Called phone number
 * 
 * OPTIONAL PARAMETERS:
 * - mode: Operation mode (callback/voicemail)
 * 
 * EXTERNAL DEPENDENCIES:
 * - Mailgun API for email notifications
 * - TaskRouter for queue management
 * 
 * CRITICAL LOGGING:
 * - All parameter validation
 * - API calls and responses
 * - Task creation results
 * - Error conditions with full context
 * 
 * EMERGENCY CONTACTS:
 * - Primary: [Contact info]
 * - Secondary: [Contact info]
 */
```

## Troubleshooting Decision Tree

```
1. Is the function receiving requests?
   ├── NO → Check phone number webhook configuration
   └── YES → Continue to step 2

2. Are parameters being passed correctly?
   ├── NO → Check Studio Flow widget configuration
   └── YES → Continue to step 3

3. Is parameter validation passing?
   ├── NO → Review required parameter list and validation logic
   └── YES → Continue to step 4

4. Are external API calls succeeding?
   ├── NO → Check API credentials and network connectivity
   └── YES → Continue to step 5

5. Is business logic executing correctly?
   ├── NO → Review function logic and error handling
   └── YES → Check result handling and callback execution
```

## Emergency Contact Protocol

When debugging critical issues:

1. **Document everything** - Log review process and findings
2. **Preserve evidence** - Save logs and error messages
3. **Communicate status** - Update stakeholders on progress
4. **Follow up** - Post-mortem analysis and prevention

## Conclusion

Following these debugging practices ensures:
- Rapid emergency response (minutes vs hours/days)
- Comprehensive diagnostic information
- Consistent troubleshooting approach
- Prevention of future emergencies

**Remember**: The voicemail emergency was solved by comprehensive logging. Without proper logging, emergencies take days to solve. With proper logging, they take minutes.

Every Connie feature must be "emergency-ready" with comprehensive diagnostic logging.