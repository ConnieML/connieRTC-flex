---
sidebar_label: connie-profiles-integration
title: Connie Profiles Integration
---

## Feature Summary

The Connie Profiles Integration feature enhances the agent experience by automatically displaying relevant customer profile information when handling calls. This integration fetches customer profile data based on the caller's phone number and displays it in the Enhanced CRM Container within Flex.

## Flex User Experience

When an agent receives a call, the Enhanced CRM Container automatically loads the customer's profile page, showing their personal information, program enrollments, and other relevant details. This eliminates the need for agents to manually search for customer information, improving efficiency and customer service.

![Connie Profiles Integration](/img/features/connie-profiles/profile-view.png)

## Setup and Dependencies

This feature requires:

1. The Enhanced CRM Container feature to be enabled
2. The `profile-proxy` Twilio Function deployed to fetch profile data
3. A Studio Flow configured to handle the profile lookup and task creation

## Architecture

The integration follows a streamlined architecture:

1. **profile-proxy Function**: A single function that fetches profile data from the Connie API and returns both the data and a formatted CRM URL
2. **Studio Flow**: Calls the profile-proxy function and sets task attributes with the CRM URL
3. **Enhanced CRM Container**: Displays the profile view using the URL from task attributes

### Function Setup

The key function in this integration is:

**profile-proxy**: 
- Purpose: Fetches customer profile data based on phone number
- Endpoint: Makes a GET request to `https://connie.technology/profiles` with the phone number parameter
- Returns: Profile data and a formatted CRM URL pointing to the profile view page
- profile-proxy.js Base URI: `https://connie-profiles-v01-6987.twil.io/profile-proxy`
- Browser Testing: `https://connie-profiles-v01-6987.twil.io/profile-proxy?phoneNumber=+12392046651`
- Curl Testing: curl "https://connie-profiles-v01-6987.twil.io/profile-proxy?phoneNumber=%2B12392046651" | jq .
  

### Studio Flow Configuration

The Studio Flow should be configured to:
1. Receive incoming calls
2. Call the profile-proxy function with the caller's phone number
3. Create a Flex task with the CRM URL in its attributes

Here's the recommended Studio Flow configuration:

```json
{
  "description": "Connie-Profiles-Flow",
  "states": [
    {
      "name": "Trigger",
      "type": "trigger",
      "transitions": [
        {
          "event": "incomingMessage"
        },
        {
          "next": "Get_Profile",
          "event": "incomingCall"
        },
        {
          "event": "incomingConversationMessage"
        },
        {
          "event": "incomingRequest"
        },
        {
          "event": "incomingParent"
        }
      ],
      "properties": {
        "offset": {
          "x": 0,
          "y": 0
        }
      }
    },
    {
      "name": "Get_Profile",
      "type": "run-function",
      "transitions": [
        {
          "next": "send_to_flex",
          "event": "success"
        },
        {
          "next": "send_to_flex",
          "event": "fail"
        }
      ],
      "properties": {
        "url": "https://your-domain.twil.io/features/profile-proxy",
        "method": "GET",
        "parameters": [
          {
            "value": "{{trigger.call.From}}",
            "key": "phoneNumber"
          }
        ]
      }
    },
    {
      "name": "send_to_flex",
      "type": "send-to-flex",
      "transitions": [
        {
          "event": "callComplete"
        },
        {
          "event": "failedToEnqueue"
        },
        {
          "event": "callFailure"
        }
      ],
      "properties": {
        "workflow": "YOUR_WORKFLOW_SID",
        "channel": "YOUR_VOICE_CHANNEL_SID",
        "attributes": "{\"type\": \"inbound\", \"name\": \"{{trigger.call.From}}\", \"call_sid\": \"{{trigger.call.CallSid}}\", \"crm_url\": \"{{widgets.Get_Profile.parsed.crm_url}}\"}"
      }
    }
  ],
  "initial_state": "Trigger",
  "flags": {
    "allow_concurrent_calls": true
  }
}
```

### Enhanced CRM Container Configuration

The Enhanced CRM Container must be configured to use the `crm_url` attribute from the task:

```json
"enhanced_crm_container": {
  "enabled": true,
  "url": "{{task.attributes.crm_url}}",
  "should_display_url_when_no_tasks": true,
  "display_url_when_no_tasks": "https://your-domain.twil.io/profile-view?empty=true",
  "enable_url_tab": true,
  "url_tab_title": "Customer Profile"
}
```

## Migration Guide

To migrate from the current implementation to the recommended architecture, follow these steps:

### Step 1: Update the profile-proxy function

Ensure the `profile-proxy.js` function returns both the profile data and a formatted CRM URL:

```javascript
exports.handler = async function(context, event, callback) {
  const response = new Twilio.Response();
  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.appendHeader('Content-Type', 'application/json');
  
  try {
    const phoneParam = event.phoneNumber;
    if (!phoneParam) {
      response.setStatusCode(400);
      response.setBody({ error: 'Phone number is required' });
      return callback(null, response);
    }
    
    // Call the Connie Profiles API
    const axios = require('axios');
    const apiResponse = await axios.get(`https://connie.technology/profiles?phoneNumber=${encodeURIComponent(phoneParam)}`);
    
    // Extract profile data
    const profile = apiResponse.data.profile;
    
    // Generate a CRM URL for the profile view
    const crmUrl = `https://${context.DOMAIN_NAME}/profile-view?profileId=${profile.id}&name=${encodeURIComponent(profile.firstname + ' ' + profile.lastname)}&phone=${encodeURIComponent(profile.phone)}`;
    
    // Return both the profile data and the CRM URL
    response.setBody({
      profile: profile,
      crm_url: crmUrl
    });
    
    return callback(null, response);
  } catch (error) {
    console.error('Error fetching profile:', error);
    response.setStatusCode(500);
    response.setBody({ error: 'Failed to fetch profile data' });
    return callback(null, response);
  }
};
```

### Step 2: Remove the redundant fetch-profile-and-update-task function

Since we'll be handling the task attribute updates directly in Studio Flow, you can safely remove the `fetch-profile-and-update-task.js` function.

### Step 3: Update your Studio Flow

1. Open your Studio Flow in the Twilio Console
2. Remove any references to the `fetch-profile-and-update-task` function
3. Add a Run Function widget that calls the `profile-proxy` function:
   - Set the Function URL to your `profile-proxy` function
   - Add a parameter with key `phoneNumber` and value `{{trigger.call.From}}`
4. Update your Send to Flex widget to include the CRM URL in the task attributes:
   - Modify the attributes JSON to include `"crm_url": "{{widgets.Get_Profile.parsed.crm_url}}"`

### Step 4: Test the integration

1. Make a test call to your Twilio number
2. Accept the task in Flex
3. Verify that the Enhanced CRM Container displays the correct profile

### Step 5: Clean up unused code

Once you've confirmed everything is working correctly:
1. Remove any references to the old functions in your codebase
2. Update your documentation to reflect the new architecture

## How does it work?

1. When a call comes in, the Studio Flow triggers the `profile-proxy` function
2. The function looks up the customer profile based on the caller's phone number
3. The function generates a CRM URL pointing to the customer's profile page
4. The Studio Flow sets the task attributes with the `crm_url` from the function response
5. When an agent accepts the task, the Enhanced CRM Container loads the URL from `task.attributes.crm_url`

## Troubleshooting

If the profile doesn't load correctly:

1. Check the function logs to ensure the profile lookup is successful
2. Verify the task is being created with the correct `crm_url` attribute
3. Confirm the Enhanced CRM Container is configured to use `{{task.attributes.crm_url}}`
4. Ensure the profile view page is accessible from the Flex agent's browser

## Alternative Implementation

For more complex scenarios, you can also use the HTTP Request widget in Studio Flow:

```json
{
  "name": "Get_Profile_Direct",
  "type": "make-http-request",
  "transitions": [
    {
      "next": "Set_Task_Attributes",
      "event": "success"
    },
    {
      "next": "send_to_flex",
      "event": "fail"
    }
  ],
  "properties": {
    "method": "GET",
    "url": "https://connie.technology/profiles?phoneNumber={{trigger.call.From | url_encode}}",
    "content_type": "application/json"
  }
}
```

This approach might be useful if you need to perform additional data processing in Studio Flow before creating the task.
