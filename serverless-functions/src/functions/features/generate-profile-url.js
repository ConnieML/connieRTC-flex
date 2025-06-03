/**
 * Simple function to generate a profile URL without making API calls
 */
exports.handler = async function(context, event, callback) {
  const response = new Twilio.Response();
  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.appendHeader('Content-Type', 'application/json');
  
  try {
    const phoneNumber = event.phoneNumber;
    
    if (!phoneNumber) {
      response.setStatusCode(400);
      response.setBody({ error: 'Phone number is required' });
      return callback(null, response);
    }
    
    // Generate a URL to the profile view page with just the phone number
    // Using the correct path /profile-view instead of /features/profile-view
    const profileUrl = `https://${context.DOMAIN_NAME}/profile-view?phone=${encodeURIComponent(phoneNumber)}`;
    
    response.setBody({
      crm_url: profileUrl
    });
    
    return callback(null, response);
  } catch (error) {
    console.error('Error generating profile URL:', error);
    response.setStatusCode(500);
    response.setBody({ error: 'Failed to generate profile URL' });
    return callback(null, response);
  }
};
