exports.handler = async (context, event, callback) => {
  try {
    // Add debug logging to see what parameters are received
    console.log('profile-view received event:', JSON.stringify(event));
    
    const profileId = event.profileId || 'Unknown';
    const phone = event.phone || '+15109309015';
    const name = event.name || 'Test User';
    const program = event.program || 'Test Program';
    const program2 = event.program2 || '';
    const program3 = event.program3 || '';
    const language = event.language || 'English';
    const location = event.location || '';
    const pcp = event.pcp || '';
    const pcpContact = event.pcpContact || '';
    const pcpAffiliation = event.pcpAffiliation || '';
    const primaryCaregiver = event.primaryCaregiver || '';
    const primaryCaregiverPhone = event.primaryCaregiverPhone || '';
    const profileImage = event.profileImage || '';
    const dob = event.dob || '';
    
    // Create a more detailed HTML page with all parameters
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Profile #${profileId}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
        .card { background: white; border-radius: 8px; padding: 20px; max-width: 600px; margin: 20px auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { display: flex; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 15px; }
        .avatar { width: 80px; height: 80px; border-radius: 40px; margin-right: 20px; overflow: hidden; }
        .avatar img { width: 100%; height: 100%; object-fit: cover; }
        .avatar-fallback { width: 80px; height: 80px; border-radius: 40px; margin-right: 20px; background: #e0e0e0; display: flex; align-items: center; justify-content: center; font-size: 32px; color: #757575; }
        h1 { margin: 0; color: #333; font-size: 24px; }
        .info-row { margin-bottom: 15px; display: flex; }
        .label { font-weight: bold; color: #555; width: 150px; }
        .value { color: #333; flex: 1; }
        .section { margin-top: 20px; padding-top: 15px; border-top: 1px solid #eee; }
        .section-title { font-size: 18px; color: #333; margin-bottom: 15px; }
        .program-badge { display: inline-block; background: #e3f2fd; color: #1976d2; padding: 4px 8px; border-radius: 4px; margin-right: 8px; margin-bottom: 8px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          ${profileImage ? 
            `<div class="avatar"><img src="${profileImage}" alt="${name}" /></div>` : 
            `<div class="avatar-fallback">${name.charAt(0)}</div>`
          }
          <div>
            <h1>${name}</h1>
            <div style="color: #666;">${phone}</div>
            ${dob ? `<div style="color: #666;">DOB: ${dob}</div>` : ''}
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Programs</div>
          ${program ? `<div class="program-badge">${program}</div>` : ''}
          ${program2 ? `<div class="program-badge">${program2}</div>` : ''}
          ${program3 ? `<div class="program-badge">${program3}</div>` : ''}
          ${!program && !program2 && !program3 ? '<div class="value">No programs</div>' : ''}
        </div>
        
        <div class="section">
          <div class="section-title">Personal Information</div>
          <div class="info-row">
            <div class="label">Profile ID:</div>
            <div class="value">${profileId}</div>
          </div>
          ${language ? `
          <div class="info-row">
            <div class="label">Language:</div>
            <div class="value">${language}</div>
          </div>` : ''}
          ${location ? `
          <div class="info-row">
            <div class="label">Location:</div>
            <div class="value">${location}</div>
          </div>` : ''}
        </div>
        
        ${(pcp || pcpContact || pcpAffiliation) ? `
        <div class="section">
          <div class="section-title">Primary Care Provider</div>
          ${pcp ? `
          <div class="info-row">
            <div class="label">Name:</div>
            <div class="value">${pcp}</div>
          </div>` : ''}
          ${pcpContact ? `
          <div class="info-row">
            <div class="label">Contact:</div>
            <div class="value">${pcpContact}</div>
          </div>` : ''}
          ${pcpAffiliation ? `
          <div class="info-row">
            <div class="label">Affiliation:</div>
            <div class="value">${pcpAffiliation}</div>
          </div>` : ''}
        </div>` : ''}
        
        ${(primaryCaregiver || primaryCaregiverPhone) ? `
        <div class="section">
          <div class="section-title">Primary Caregiver</div>
          ${primaryCaregiver ? `
          <div class="info-row">
            <div class="label">Name:</div>
            <div class="value">${primaryCaregiver}</div>
          </div>` : ''}
          ${primaryCaregiverPhone ? `
          <div class="info-row">
            <div class="label">Phone:</div>
            <div class="value">${primaryCaregiverPhone}</div>
          </div>` : ''}
        </div>` : ''}
      </div>
      
      <script>
        // Notify parent window that the iframe has loaded
        window.addEventListener('load', function() {
          if (window.parent) {
            window.parent.postMessage('iframe-loaded', '*');
          }
        });
      </script>
    </body>
    </html>
    `;
    
    // Handle OPTIONS preflight requests
    if (event.request && event.request.method === 'OPTIONS') {
      const response = new Twilio.Response();
      response.appendHeader('Access-Control-Allow-Origin', '*');
      response.appendHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      response.appendHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      response.appendHeader('Access-Control-Max-Age', '86400');
      response.setStatusCode(204);
      return callback(null, response);
    }

    // For regular requests
    const response = new Twilio.Response();
    response.appendHeader('Content-Type', 'text/html');
    response.appendHeader('Access-Control-Allow-Origin', '*');
    response.appendHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.appendHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Add Content-Security-Policy header with connie.technology and postimg.cc
    response.appendHeader('Content-Security-Policy', 
      "frame-ancestors 'self' https://flex.twilio.com https://*.flex.twilio.com https://*.twilio.com https://*.twil.io https://connie.team https://*.connie.team https://dev.connie.team https://portal.connie.team https://connie.technology https://i.postimg.cc https://*.postimg.cc http://localhost:* https://*.augmentcxm.com; img-src 'self' https://i.postimg.cc https://*.postimg.cc data:");
    
    response.setBody(html);
    
    return callback(null, response);
  } catch (error) {
    console.error('Error in profile-view:', error.message);
    
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Error</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .card { background: white; border-radius: 8px; padding: 20px; max-width: 600px; margin: 20px auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .error { color: #d32f2f; background: #ffebee; border: 1px solid #ffcdd2; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        h1 { color: #333; font-size: 24px; }
        .details { margin-top: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>Profile Error</h1>
        <div class="error">${error.message}</div>
        <div class="details">
          <p>There was an error loading the profile information. Please try again later or contact support.</p>
          <p>Time: ${new Date().toLocaleString()}</p>
        </div>
      </div>
      
      <script>
        // Notify parent window that the iframe has loaded (even with error)
        window.addEventListener('load', function() {
          if (window.parent) {
            window.parent.postMessage('iframe-error', '*');
          }
        });
      </script>
    </body>
    </html>
    `;
    
    const response = new Twilio.Response();
    response.appendHeader('Content-Type', 'text/html');
    response.appendHeader('Access-Control-Allow-Origin', '*');
    response.appendHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.appendHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.appendHeader('Content-Security-Policy', 
      "frame-ancestors 'self' https://flex.twilio.com https://*.flex.twilio.com https://*.twilio.com https://*.twil.io https://connie.team https://*.connie.team https://dev.connie.team https://portal.connie.team https://connie.technology https://i.postimg.cc https://*.postimg.cc http://localhost:* https://*.augmentcxm.com; img-src 'self' https://i.postimg.cc https://*.postimg.cc data:");
    response.setStatusCode(500);
    response.setBody(html);
    
    return callback(null, response);
  }
};
