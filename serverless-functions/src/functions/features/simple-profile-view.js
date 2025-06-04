// This function should be deployed to connie-profiles-v01-6987.twil.io
exports.handler = function(context, event, callback) {
  const response = new Twilio.Response();
  
  // Set headers to allow embedding in iframe
  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Content-Type', 'text/html');
  // No X-Frame-Options header (recommended when using CSP)
  
  // Add Content-Security-Policy with proper frame-ancestors directive
  response.appendHeader('Content-Security-Policy', 
    "frame-ancestors 'self' https://flex.twilio.com https://*.flex.twilio.com https://*.twilio.com https://*.twil.io https://connie.team https://*.connie.team https://dev.connie.team https://portal.connie.team https://connie.technology https://*.augmentcxm.com");
  
  // Add cache control headers
  response.appendHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.appendHeader('Pragma', 'no-cache');
  response.appendHeader('Expires', '0');
  
  const { profileId, name, phone } = event;
  
  // Generate HTML content
  const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Simple Profile View</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 20px; }
      h1 { color: #1976D2; }
      .profile-info { margin-top: 20px; }
      .field { margin-bottom: 10px; }
      .label { font-weight: bold; }
    </style>
  </head>
  <body>
    <h1>Simple Profile View</h1>
    <div class="profile-info">
      <h2>Profile Information</h2>
      <div class="field">
        <span class="label">Profile ID:</span> ${profileId}
      </div>
      <div class="field">
        <span class="label">Name:</span> ${name}
      </div>
      <div class="field">
        <span class="label">Phone:</span> ${phone}
      </div>
    </div>
    <div style="margin-top: 30px;">
      <h3>Raw Event Data:</h3>
      <pre>${JSON.stringify(event, null, 2)}</pre>
    </div>
  </body>
  </html>
  `;
  
  response.setBody(htmlContent);
  return callback(null, response);
};
