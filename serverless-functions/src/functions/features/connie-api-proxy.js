/**
 * Proxy function to forward requests to dev.connie.team with proper CORS headers
 */
const axios = require('axios');

exports.handler = async function(context, event, callback) {
  const response = new Twilio.Response();
  
  // Set CORS headers to allow Flex to access this function
  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.appendHeader('Content-Type', 'application/json');
  response.appendHeader('Content-Security-Policy', 
    "frame-ancestors 'self' https://flex.twilio.com https://*.flex.twilio.com https://*.twilio.com https://*.twil.io https://connie.team https://*.connie.team https://dev.connie.team https://portal.connie.team https://connie.technology http://localhost:* https://*.augmentcxm.com");
  
  // Handle OPTIONS preflight requests
  if (event.request && event.request.method === 'OPTIONS') {
    response.setStatusCode(204);
    return callback(null, response);
  }
  
  try {
    // Get the target endpoint from the path parameter or default to 'profiles'
    const endpoint = event.endpoint || 'profiles';
    
    // Get the HTTP method or default to GET
    const method = (event.method || 'GET').toLowerCase();
    
    // Build the URL to the Connie API
    const url = `https://connie.technology/${endpoint}`;
    
    // Prepare request config
    const config = {
      method,
      url,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    // Add query parameters if present
    if (Object.keys(event).length > 0) {
      // Filter out Twilio's internal parameters
      const queryParams = { ...event };
      ['endpoint', 'method', 'request'].forEach(key => delete queryParams[key]);
      
      if (method === 'get' && Object.keys(queryParams).length > 0) {
        config.params = queryParams;
      } else if (method !== 'get') {
        config.data = queryParams;
      }
    }
    
    console.log(`Proxying ${method.toUpperCase()} request to ${url}`);
    
    // Make the request to the Connie API
    const apiResponse = await axios(config);
    
    // Forward the response back to the client
    response.setBody(apiResponse.data);
    return callback(null, response);
    
  } catch (error) {
    console.error('Error proxying request to Connie API:', error);
    
    // Forward error status if available
    if (error.response) {
      response.setStatusCode(error.response.status);
      response.setBody({
        error: 'Error from Connie API',
        message: error.message,
        data: error.response.data
      });
    } else {
      response.setStatusCode(500);
      response.setBody({
        error: 'Failed to proxy request',
        message: error.message
      });
    }
    
    return callback(null, response);
  }
};
