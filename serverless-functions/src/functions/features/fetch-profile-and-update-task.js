const axios = require('axios');
const { prepareFlexFunction, twilioExecute } = require(Runtime.getFunctions()['common/helpers/function-helper'].path);

const requiredParameters = [
  { key: 'taskSid', purpose: 'unique ID of task to update' },
  { key: 'phoneNumber', purpose: 'phone number to look up profile for' }
];

exports.handler = prepareFlexFunction(requiredParameters, async (context, event, callback, response, handleError) => {
  try {
    const { taskSid, phoneNumber } = event;
    
    console.log(`Fetching profile for ${phoneNumber} and updating task ${taskSid}`);
    
    // Step 1: Call the profile-proxy function to get the profile
    const profileResponse = await axios.get(
      `https://${context.DOMAIN_NAME}/features/profile-proxy?phoneNumber=${encodeURIComponent(phoneNumber)}`,
      {
        auth: {
          username: context.ACCOUNT_SID,
          password: context.AUTH_TOKEN
        }
      }
    );
    
    console.log('Profile response:', JSON.stringify(profileResponse.data));
    
    // Step 2: Get the CRM URL from the profile response
    const crmUrl = profileResponse.data.crm_url;
    
    if (!crmUrl) {
      throw new Error('No CRM URL found in profile response');
    }
    
    // Step 3: Update the task attributes with the CRM URL
    const task = await twilioExecute(context, (client) =>
      client.taskrouter.v1.workspaces(context.TWILIO_FLEX_WORKSPACE_SID)
        .tasks(taskSid)
        .fetch()
    );
    
    const currentAttributes = JSON.parse(task.data.attributes);
    const updatedAttributes = {
      ...currentAttributes,
      crm_url: crmUrl
    };
    
    const result = await twilioExecute(context, (client) =>
      client.taskrouter.v1.workspaces(context.TWILIO_FLEX_WORKSPACE_SID)
        .tasks(taskSid)
        .update({
          attributes: JSON.stringify(updatedAttributes)
        })
    );
    
    response.setBody({
      success: true,
      taskSid: result.data.sid,
      crm_url: crmUrl
    });
    
  } catch (error) {
    console.error('Error in fetch-profile-and-update-task:', error.message);
    return handleError(error);
  }
});