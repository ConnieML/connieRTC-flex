const axios = require('axios');

exports.handler = async (context, event, callback) => {
  try {
    console.log('Incoming request with phone:', event.From);
    
    // Normalize the phone number
    let phoneNumber = event.From || '';
    if (phoneNumber && !phoneNumber.startsWith('+')) {
      phoneNumber = `+${phoneNumber}`;
    }
    console.log('Normalized phone number for lookup:', phoneNumber);
    
    // For a real implementation, we would fetch the profile from the database
    // For now, let's just use a simple lookup
    let profileId = 'unknown';
    let name = 'Unknown User';
    let program = 'No Program';
    
    // Simple hardcoded lookup for demo purposes
    if (phoneNumber === '+15109309015') {
      profileId = '2';
      name = 'Christopher Berno';
      program = 'Meals on Wheels';
    }
    
    if (profileId !== 'unknown') {
      console.log('Profile found:', profileId);
    } else {
      console.log('No profile found for phone:', phoneNumber);
    }
    
    // Create a response object that Flex expects
    const responseObject = {
      success: true
    };
    
    // Add a timestamp parameter to force a fresh load and prevent caching issues
    const timestamp = new Date().getTime();
    
    // Use our own Twilio Function to serve the profile view
    responseObject.crm_url = `https://${context.DOMAIN_NAME}/profile-view?profileId=${profileId}&phone=${encodeURIComponent(phoneNumber)}&name=${encodeURIComponent(name)}&program=${encodeURIComponent(program)}&t=${timestamp}`;
    
    // Handle OPTIONS preflight requests
    if (event.request && event.request.method === 'OPTIONS') {
      const response = new Twilio.Response();
      response.appendHeader('Access-Control-Allow-Origin', '*'); // Allow all origins for development
      response.appendHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      response.appendHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      response.appendHeader('Access-Control-Max-Age', '86400');
      response.setStatusCode(204);
      return callback(null, response);
    }

    // For regular requests
    const twilioResponse = new Twilio.Response();
    twilioResponse.appendHeader('Access-Control-Allow-Origin', '*'); // Allow all origins for development
    twilioResponse.appendHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    twilioResponse.appendHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    twilioResponse.appendHeader('Content-Type', 'application/json');
    twilioResponse.setBody(responseObject);
    
    return callback(null, twilioResponse);
  } catch (error) {
    console.error('API error:', error.message);
    
    // Return error with proper CORS headers
    const twilioResponse = new Twilio.Response();
    twilioResponse.appendHeader('Access-Control-Allow-Origin', '*'); // Allow all origins for development
    twilioResponse.appendHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    twilioResponse.appendHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    twilioResponse.appendHeader('Content-Type', 'application/json');
    twilioResponse.setStatusCode(500);
    twilioResponse.setBody({ 
      success: false, 
      error: error.message,
      crm_url: `https://${context.DOMAIN_NAME}/profile-view?error=true&t=${new Date().getTime()}`
    });
    
    return callback(null, twilioResponse);
  }
};
