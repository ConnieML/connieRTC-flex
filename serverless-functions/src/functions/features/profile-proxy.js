exports.handler = async function(context, event, callback) {
  const response = new Twilio.Response();
  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.appendHeader('Content-Type', 'application/json');
  // Add Content-Security-Policy header to match profile-view.js
  response.appendHeader('Content-Security-Policy', 
    "frame-ancestors 'self' https://flex.twilio.com https://*.flex.twilio.com https://*.twilio.com https://*.twil.io https://connie.team https://*.connie.team https://dev.connie.team https://portal.connie.team https://connie.technology https://i.postimg.cc https://*.postimg.cc http://localhost:* https://*.augmentcxm.com");
  
  try {
    const phoneParam = event.From || event.phoneNumber;
    console.log('profile-proxy: Received phone parameter:', phoneParam);
    
    if (!phoneParam) {
      console.log('profile-proxy: No phone number provided in request');
      response.setStatusCode(400);
      response.setBody({ error: 'Phone number is required' });
      return callback(null, response);
    }
    
    // Normalize the phone number to ensure consistent format
    const normalizedPhone = phoneParam.replace(/[^+\d]/g, '');
    console.log('profile-proxy: Normalized phone number:', normalizedPhone);
    
    // Try direct call to Connie API instead of using the proxy
    const axios = require('axios');
    console.log('profile-proxy: Attempting direct call to Connie API');
    
    try {
      // Direct call to Connie API - using connie.technology instead of dev.connie.team
      const directApiUrl = `https://connie.technology/profiles?phoneNumber=${encodeURIComponent(normalizedPhone)}`;
      console.log('profile-proxy: Direct API URL:', directApiUrl);
      
      const apiResponse = await axios.get(directApiUrl);
      console.log('profile-proxy: Direct API call successful');
      
      // Check if profile exists
      if (!apiResponse.data.profile) {
        console.log('profile-proxy: No profile found in API response');
        response.setStatusCode(404);
        response.setBody({ 
          error: 'No profile found for this phone number',
          crm_url: `https://${context.DOMAIN_NAME}/features/profile-view?empty=true&phone=${encodeURIComponent(normalizedPhone)}`
        });
        return callback(null, response);
      }
      
      // Extract profile data
      const profile = apiResponse.data.profile;
      console.log('profile-proxy: Profile found:', profile.id);
      
      // Generate a CRM URL for the profile view
      const crmUrl = `https://${context.DOMAIN_NAME}/features/profile-view?profileId=${profile.id}&name=${encodeURIComponent(profile.firstname + ' ' + profile.lastname)}&phone=${encodeURIComponent(profile.phone)}`;
      
      // Return both the profile data and the CRM URL
      response.setBody({
        profile: profile,
        crm_url: crmUrl
      });
      
      return callback(null, response);
    } catch (directApiError) {
      console.error('profile-proxy: Direct API call failed:', directApiError.message);
      
      // Fall back to using the proxy if direct call fails
      console.log('profile-proxy: Falling back to API proxy');
      const proxyUrl = `https://${context.DOMAIN_NAME}/features/connie-api-proxy?endpoint=profiles&phoneNumber=${encodeURIComponent(normalizedPhone)}`;
      console.log('profile-proxy: API proxy URL:', proxyUrl);
      
      const apiResponse = await axios.get(
        proxyUrl,
        {
          auth: {
            username: context.ACCOUNT_SID,
            password: context.AUTH_TOKEN
          }
        }
      );
      
      // Check if profile exists
      if (!apiResponse.data.profile) {
        response.setStatusCode(404);
        response.setBody({ 
          error: 'No profile found for this phone number',
          crm_url: `https://${context.DOMAIN_NAME}/features/profile-view?empty=true&phone=${encodeURIComponent(normalizedPhone)}`
        });
        return callback(null, response);
      }
      
      // Extract profile data
      const profile = apiResponse.data.profile;
      
      // Generate a CRM URL for the profile view
      const crmUrl = `https://${context.DOMAIN_NAME}/features/profile-view?profileId=${profile.id}&name=${encodeURIComponent(profile.firstname + ' ' + profile.lastname)}&phone=${encodeURIComponent(profile.phone)}`;
      
      // Return both the profile data and the CRM URL
      response.setBody({
        profile: profile,
        crm_url: crmUrl
      });
      
      return callback(null, response);
    }
  } catch (error) {
    console.error('Error fetching profile:', error);
    response.setStatusCode(500);
    response.setBody({ 
      error: 'Failed to fetch profile data',
      crm_url: `https://${context.DOMAIN_NAME}/features/profile-view?empty=true&error=true`
    });
    return callback(null, response);
  }
};
