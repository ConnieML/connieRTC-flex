---
sidebar_label: "Emergency Diagnostics"
sidebar_position: 3
title: "Emergency Diagnostic Commands - Quick Reference"
---

# 🚨 Emergency Diagnostic Commands - Quick Reference

**Print this page and keep it accessible during Connie emergencies.**

## STEP 1: Immediate Response (First 2 minutes)

### Primary Diagnostic Tool - START HERE
```bash
# Real-time function logs - MOST IMPORTANT COMMAND
twilio serverless:logs --service-sid ZS906734499c94e8fb7c2eca7c708f8f6b --tail
```

### Quick Health Check
```bash
# Recent failed calls
twilio api:core:calls:list --limit 5 --status failed

# Recent completed calls  
twilio api:core:calls:list --limit 5 --status completed

# Current Twilio profile
twilio profiles:list
```

## STEP 2: Function-Level Diagnostics

### Serverless Function Investigation
```bash
# All functions in service
twilio serverless:functions:list --service-sid ZS906734499c94e8fb7c2eca7c708f8f6b

# Recent logs for specific function
twilio serverless:logs --service-sid ZS906734499c94e8fb7c2eca7c708f8f6b --function-sid [FUNCTION_SID] --limit 20

# Environment variables check
twilio serverless:environments:list --service-sid ZS906734499c94e8fb7c2eca7c708f8f6b
```

### Manual Function Testing
```bash
# Test function endpoint directly
curl -X POST https://[DEPLOYMENT_DOMAIN]/[FUNCTION_PATH] \
  -d "CallSid=test&From=%2B15551234567&To=%2B15559876543&mode=debug" \
  -H "Content-Type: application/x-www-form-urlencoded"
```

## STEP 3: Studio Flow Analysis

### Flow Execution Investigation
```bash
# Recent flow executions
twilio api:studio:v2:flows:executions:list --flow-sid [FLOW_SID] --limit 10

# Specific execution details
twilio api:studio:v2:flows:executions:fetch --flow-sid [FLOW_SID] --sid [EXECUTION_SID]

# Execution steps (deep dive)
twilio api:studio:v2:flows:executions:steps:list --flow-sid [FLOW_SID] --execution-sid [EXECUTION_SID]

# All flows in account
twilio api:studio:v2:flows:list
```

## STEP 4: TaskRouter Investigation

### Queue and Workflow Analysis
```bash
# Recent tasks
twilio api:taskrouter:v1:workspaces:tasks:list --workspace-sid WS7d3bcedb08a791b201aa4ec4fdadcfe6 --limit 10

# Specific task details
twilio api:taskrouter:v1:workspaces:tasks:fetch --workspace-sid WS7d3bcedb08a791b201aa4ec4fdadcfe6 --sid [TASK_SID]

# All workflows
twilio api:taskrouter:v1:workspaces:workflows:list --workspace-sid WS7d3bcedb08a791b201aa4ec4fdadcfe6

# All queues
twilio api:taskrouter:v1:workspaces:task-queues:list --workspace-sid WS7d3bcedb08a791b201aa4ec4fdadcfe6
```

## STEP 5: Call-Level Investigation

### Detailed Call Analysis
```bash
# Specific call details
twilio api:core:calls:fetch --sid [CALL_SID]

# Call recordings
twilio api:core:calls:recordings:list --call-sid [CALL_SID]

# Call events
twilio api:core:calls:events:list --call-sid [CALL_SID]

# Call feedback
twilio api:core:calls:feedback:fetch --call-sid [CALL_SID]
```

## CRITICAL SERVICE IDs

**Memorize these for fast emergency response:**

```bash
# Connie Serverless Service
SERVICE_SID="ZS906734499c94e8fb7c2eca7c708f8f6b"

# Flex Workspace
WORKSPACE_SID="WS7d3bcedb08a791b201aa4ec4fdadcfe6"

# Common Commands with SIDs
twilio serverless:logs --service-sid ZS906734499c94e8fb7c2eca7c708f8f6b --tail
twilio api:taskrouter:v1:workspaces:tasks:list --workspace-sid WS7d3bcedb08a791b201aa4ec4fdadcfe6 --limit 10
```

## Emergency Response Scenarios

### Scenario 1: "Option not available at this time"
```bash
# Check workflow configuration
twilio api:taskrouter:v1:workspaces:workflows:list --workspace-sid WS7d3bcedb08a791b201aa4ec4fdadcfe6

# Check function logs for workflow errors
twilio serverless:logs --service-sid ZS906734499c94e8fb7c2eca7c708f8f6b --tail | grep -i workflow
```

### Scenario 2: Voicemail not working
```bash
# Check voicemail function logs
twilio serverless:logs --service-sid ZS906734499c94e8fb7c2eca7c708f8f6b --tail | grep -i voicemail

# Test voicemail function directly
curl -X POST https://[DOMAIN]/features/callback-and-voicemail-with-email/studio/wait-experience \
  -d "CallSid=test&mode=voicemail" \
  -H "Content-Type: application/x-www-form-urlencoded"
```

### Scenario 3: Email notifications not sending
```bash
# Check email function logs
twilio serverless:logs --service-sid ZS906734499c94e8fb7c2eca7c708f8f6b --tail | grep -i email

# Test Mailgun API directly
curl -s --user "api:[MAILGUN_API_KEY]" \
    https://api.mailgun.net/v3/[MAILGUN_DOMAIN]/messages \
    -F from='Test <test@[MAILGUN_DOMAIN]>' \
    -F to='[ADMIN_EMAIL]' \
    -F subject='Emergency Test' \
    -F text='Testing Mailgun during emergency'
```

### Scenario 4: Studio Flow not executing
```bash
# Check phone number webhook configuration
twilio api:core:incoming-phone-numbers:list --phone-number [PHONE_NUMBER]

# Check if flow is published
twilio api:studio:v2:flows:fetch --sid [FLOW_SID]

# Recent flow executions
twilio api:studio:v2:flows:executions:list --flow-sid [FLOW_SID] --limit 5
```

## Log Analysis Commands

### Filter Logs by Severity
```bash
# Error logs only
twilio serverless:logs --service-sid ZS906734499c94e8fb7c2eca7c708f8f6b --tail | grep -i error

# Warning logs
twilio serverless:logs --service-sid ZS906734499c94e8fb7c2eca7c708f8f6b --tail | grep -i warn

# Success confirmations
twilio serverless:logs --service-sid ZS906734499c94e8fb7c2eca7c708f8f6b --tail | grep -i "completed successfully"
```

### Time-Based Log Analysis
```bash
# Last 100 log entries
twilio serverless:logs --service-sid ZS906734499c94e8fb7c2eca7c708f8f6b --limit 100

# Logs since specific time (requires date format)
twilio serverless:logs --service-sid ZS906734499c94e8fb7c2eca7c708f8f6b --start-date 2024-01-01
```

## Account-Level Diagnostics

### Account Health Check
```bash
# Account information
twilio api:core:accounts:fetch

# Account usage
twilio api:usage:records:list --limit 10

# Service status
twilio api:core:applications:list
```

### Configuration Verification
```bash
# Verify phone number configuration
twilio api:core:incoming-phone-numbers:list

# Check account balance
twilio api:core:accounts:fetch | grep Balance

# API key validation
twilio api:core:keys:list
```

## Network and Connectivity

### Webhook Testing
```bash
# Test webhook URL accessibility
curl -I https://[DEPLOYMENT_DOMAIN]/[FUNCTION_PATH]

# Test with POST data
curl -X POST https://[DEPLOYMENT_DOMAIN]/[FUNCTION_PATH] \
  -d "test=true" \
  -H "Content-Type: application/x-www-form-urlencoded"
```

### DNS and SSL Verification
```bash
# Check domain resolution
nslookup [DEPLOYMENT_DOMAIN]

# Check SSL certificate
curl -I https://[DEPLOYMENT_DOMAIN]
```

## Emergency Contact Protocol

### Documentation Process
1. **Save all command outputs** to files for analysis
2. **Timestamp everything** for accurate incident tracking
3. **Note the exact error messages** and context
4. **Document reproduction steps** for future prevention

### Command Output Saving
```bash
# Save logs to file with timestamp
twilio serverless:logs --service-sid ZS906734499c94e8fb7c2eca7c708f8f6b --limit 100 > emergency_logs_$(date +%Y%m%d_%H%M%S).txt

# Save call analysis
twilio api:core:calls:list --limit 20 > call_analysis_$(date +%Y%m%d_%H%M%S).txt
```

## Quick Status Check Script

Save this as `connie_health_check.sh`:
```bash
#!/bin/bash
echo "=== CONNIE HEALTH CHECK $(date) ==="
echo ""
echo "Recent Calls:"
twilio api:core:calls:list --limit 3
echo ""
echo "Recent Tasks:"
twilio api:taskrouter:v1:workspaces:tasks:list --workspace-sid WS7d3bcedb08a791b201aa4ec4fdadcfe6 --limit 3
echo ""
echo "Function Status:"
twilio serverless:logs --service-sid ZS906734499c94e8fb7c2eca7c708f8f6b --limit 5
echo "=== END HEALTH CHECK ==="
```

## Memory Aids

### Remember the Pattern: LOGS → CALLS → FLOWS → TASKS
1. **LOGS**: Check serverless function logs first
2. **CALLS**: Analyze call history and status
3. **FLOWS**: Investigate Studio Flow executions
4. **TASKS**: Review TaskRouter task processing

### Critical Questions to Answer
- Is the function receiving requests?
- Are parameters being passed correctly?
- Is authentication working?
- Are external APIs responding?
- Is the business logic executing?

## Emergency Escalation

If these commands don't reveal the issue:
1. Save all diagnostic output to files
2. Document exact reproduction steps
3. Identify when the issue started
4. Gather environment and configuration details
5. Escalate with complete diagnostic package

---

**Remember**: The voicemail emergency was solved by comprehensive logging showing "workflows.find is not a function". Emergency response is only as good as your logging standards. Follow the Connie Logging Standards for all features.