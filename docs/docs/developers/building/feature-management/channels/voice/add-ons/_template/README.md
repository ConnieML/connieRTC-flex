# Add-On Template

Use this template when adding new voice add-ons to Connie.

## Steps:
1. Copy this `_template` folder 
2. Rename to your add-on name (kebab-case)
3. Fill in the template files
4. Add link to main overview page
5. Update navigation if needed

## Template Structure:
- `overview.md` - Main add-on documentation
- `setup.md` - Implementation guide
- `troubleshooting.md` - Common issues

## Template Content:

### File: `overview.md`
```markdown
---
sidebar_label: Your Add-On Name
sidebar_position: [NUMBER]
title: "Your Add-On Name"
---

# Your Add-On Name

[Brief description of what this add-on does]

## What It Does
- [Feature 1]
- [Feature 2] 
- [Feature 3]

## When to Use
- [Use case 1]
- [Use case 2]
- [Use case 3]

## Compatible Workflows
- ✅ **Direct**: [Explanation]
- ✅ **Direct + Options**: [Explanation]  
- ✅ **Direct to Voicemail**: [Explanation]

## Technical Implementation
[Implementation details]

### 🚨 CRITICAL: Mandatory Logging Requirements

**ALL Connie add-ons MUST implement comprehensive logging to prevent debugging emergencies.**

#### Required Logging Pattern for Serverless Functions
```javascript
exports.handler = async function(context, event, callback) {
  // 1. ENTRY LOGGING (Always include)
  console.log('=== [ADD_ON_NAME] DEBUG START ===');
  console.log('Event parameters:', JSON.stringify(event, null, 2));
  console.log('Context domain:', context.DOMAIN_NAME);
  console.log('Timestamp:', new Date().toISOString());
  
  try {
    // 2. PARAMETER VALIDATION LOGGING
    console.log('Validating required parameters...');
    if (!event.CallSid) {
      console.error('VALIDATION ERROR: Missing CallSid');
      return callback(new Error('Missing required parameter: CallSid'));
    }
    
    // 3. BUSINESS LOGIC LOGGING
    console.log('Processing add-on logic...');
    
    // Your add-on logic here...
    
    // 4. SUCCESS LOGGING
    console.log('Add-on completed successfully');
    console.log('=== [ADD_ON_NAME] DEBUG END ===');
    return callback(null, result);
    
  } catch (error) {
    // 5. ERROR LOGGING (Critical!)
    console.error('=== [ADD_ON_NAME] ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Event data:', JSON.stringify(event, null, 2));
    console.error('=== ERROR END ===');
    
    return callback(error);
  }
};
```

#### Pre-Deployment Logging Checklist
Before deploying your add-on, verify:
- [ ] Entry/exit logging present
- [ ] Error handling with full context logging
- [ ] Parameter validation with logging
- [ ] Business logic steps logged
- [ ] External API calls logged (if applicable)
- [ ] Success/failure states logged

## Integration with Other Add-Ons
[How this works with other add-ons]

## Troubleshooting
[Common issues and solutions]
```

### File: `setup.md`
```markdown
---
sidebar_label: Setup Guide
sidebar_position: 1
title: "Your Add-On Setup"
---

# Your Add-On Setup Guide

Step-by-step implementation instructions.

## Prerequisites
- [Requirement 1]
- [Requirement 2]

## Setup Steps

### Step 1: [First Step]
[Detailed instructions]

### Step 2: [Second Step]  
[Detailed instructions]

## Configuration
[Configuration options]

## Testing
[How to test the implementation]

### 🚨 MANDATORY: Logging Validation
Before considering setup complete, verify logging works:

```bash
# Test function logging
twilio serverless:logs --service-sid [SERVICE_SID] --tail

# Test with debug parameters
curl -X POST https://[DEPLOYMENT_DOMAIN]/[FUNCTION_PATH] \
  -d "CallSid=test&mode=debug" \
  -H "Content-Type: application/x-www-form-urlencoded"

# Verify comprehensive logging output shows:
# - Entry/exit markers
# - Parameter validation
# - Business logic steps  
# - Error handling (test with invalid parameters)
```
```

### File: `troubleshooting.md`
```markdown
---
sidebar_label: Troubleshooting
sidebar_position: 2
title: "Your Add-On Troubleshooting"
---

# Your Add-On Troubleshooting

Common issues and solutions specific to this add-on.

## Common Issues

### Issue 1: [Problem Description]
**Symptoms**: [What the user sees]
**Cause**: [Why it happens]
**Solution**: [How to fix it]

### Issue 2: [Problem Description]
**Symptoms**: [What the user sees]
**Cause**: [Why it happens]
**Solution**: [How to fix it]

## Performance Issues
[Performance-related problems]

## Integration Issues
[Problems with other add-ons]
```

## Naming Conventions

### File Names
- Use kebab-case for folder names: `my-new-addon`
- Use kebab-case for file names: `setup-guide.md`

### Documentation Structure
- Start with overview/main page
- Include setup/implementation guide
- Add troubleshooting section
- Consider advanced configuration page if needed

### Sidebar Configuration
Add to main overview.md:
```markdown
- [Your Add-On Name](./add-ons/your-addon-name) - Brief description
```

Update sidebar position numbers to maintain order.

## Content Guidelines

### Writing Style
- Use clear, concise language
- Include code examples where helpful
- Provide step-by-step instructions
- Use consistent formatting

### Technical Details
- Include all necessary configuration
- Provide complete code examples
- Explain integration points
- Document error conditions

### User Experience
- Start with "What it does" and "When to use"
- Show compatibility with workflows
- Provide troubleshooting help
- Include performance considerations

## Review Checklist

Before publishing your add-on documentation:

- [ ] All template sections filled out
- [ ] Code examples tested and working
- [ ] Links to other documentation updated
- [ ] Troubleshooting section comprehensive
- [ ] Sidebar navigation updated
- [ ] Screenshots/diagrams added if helpful
- [ ] Content reviewed for clarity and accuracy

### 🚨 CRITICAL: Logging Standards Compliance
- [ ] **Comprehensive logging implemented** - Entry/exit, validation, business logic, errors
- [ ] **Emergency diagnostic commands documented** - Include specific CLI commands for troubleshooting
- [ ] **Logging validation tested** - Verified logs show complete function execution trace
- [ ] **Error scenarios tested** - Confirmed error logging provides full context for debugging
- [ ] **Performance logging included** - Function execution time and resource usage tracked