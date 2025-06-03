/**
 * Proxy function to forward requests to analytics.ytica.com with proper CORS headers
 */
const axios = require('axios');

exports.handler = async function(context, event, callback) {
  const response = new Twilio.Response();
  
  // Set CORS headers to allow Flex to access this function
  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.appendHeader('Content-Type', 'application/json');
  
  // Handle OPTIONS preflight requests
  if (event.request && event.request.method === 'OPTIONS') {
    response.setStatusCode(204);
    return callback(null, response);
  }
  
  try {
    // Get the path from the event
    const path = event.path || 'gdc/account/profile/current';
    
    // Build the URL to the Ytica API
    const url = `https://analytics.ytica.com/${path}`;
    
    console.log(`Proxying request to ${url}`);
    
    // Forward the request to Ytica
    const apiResponse = await axios({
      method: event.method || 'GET',
      url: url,
      headers: {
        'Content-Type': 'application/json',
        // Forward any authorization headers
        ...(event.authorization ? { 'Authorization': event.authorization } : {})
      },
      data: event.body ? JSON.parse(event.body) : undefined
    });
    
    // Forward the response back to the client
    response.setBody(apiResponse.data);
    return callback(null, response);
    
  } catch (error) {
    console.error('Error proxying request to Ytica:', error.message);
    
    response.setStatusCode(error.response?.status || 500);
    response.setBody({
      error: 'Error proxying request to Ytica',
      message: error.message
    });
    
    return callback(null, response);
  }
};