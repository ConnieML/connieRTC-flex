const axios = require('axios');

exports.handler = async function(context, event, callback) {
  const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');
  response.appendHeader('Access-Control-Allow-Origin', '*');
  
  try {
    const phoneNumber = event.phoneNumber || '+15109309015';
    console.log(`Testing API call to: https://connie.technology/profiles?phoneNumber=${encodeURIComponent(phoneNumber)}`);
    
    const apiResponse = await axios.get(
      `https://connie.technology/profiles?phoneNumber=${encodeURIComponent(phoneNumber)}`
    );
    
    console.log('API Response:', JSON.stringify(apiResponse.data));
    
    response.setBody({
      success: true,
      data: apiResponse.data
    });
    
    return callback(null, response);
  } catch (error) {
    console.error('API Error:', error.message);
    response.setBody({
      success: false,
      error: error.message
    });
    return callback(null, response);
  }
};