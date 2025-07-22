/*
 * Send voicemail email notification with recording attachment via Mailgun
 * This function is triggered after a voicemail is recorded and sends an email
 * to the admin with the recording attached.
 */
const axios = require('axios');
const FormData = require('form-data');

exports.handler = async function(context, event, callback) {
  console.log('Email notification handler triggered with event:', JSON.stringify(event, null, 2));

  // Enhanced environment variable validation as recommended by Twilio Support
  const requiredEnvVars = {
    ADMIN_EMAIL: context.ADMIN_EMAIL,
    MAILGUN_DOMAIN: context.MAILGUN_DOMAIN,
    MAILGUN_API_KEY: context.MAILGUN_API_KEY
  };

  const missingVars = [];
  const invalidVars = [];

  for (const [varName, varValue] of Object.entries(requiredEnvVars)) {
    if (!varValue) {
      missingVars.push(varName);
    } else {
      // Basic format validation
      switch (varName) {
        case 'ADMIN_EMAIL':
          if (!varValue.includes('@') || !varValue.includes('.')) {
            invalidVars.push(`${varName} (invalid email format)`);
          }
          break;
        case 'MAILGUN_DOMAIN':
          if (!varValue.includes('.')) {
            invalidVars.push(`${varName} (invalid domain format)`);
          }
          break;
        case 'MAILGUN_API_KEY':
          // Mailgun API keys can start with 'key-' (domain keys) or other prefixes (private keys)
          // Just check that it's a reasonable length and not obviously invalid
          if (varValue.length < 20) {
            invalidVars.push(`${varName} (appears too short - should be at least 20 characters)`);
          }
          break;
      }
    }
  }

  if (missingVars.length > 0) {
    const errorMsg = `Missing required environment variables: ${missingVars.join(', ')}`;
    console.error('Environment validation failed:', errorMsg);
    return callback(errorMsg);
  }

  if (invalidVars.length > 0) {
    const errorMsg = `Invalid environment variable formats: ${invalidVars.join(', ')}`;
    console.error('Environment validation failed:', errorMsg);
    return callback(errorMsg);
  }

  console.log('Environment variable validation passed successfully');

  // Extract event data
  const recordingUrl = event.RecordingUrl;
  const caller = event.From || event.callerNumber || 'Unknown Caller';
  const called = event.To || event.calledNumber || 'Unknown Number';
  const recordingSid = event.RecordingSid;
  const transcriptionText = event.TranscriptionText || 'Transcription not available';
  
  // Use event.Timestamp if available for precise recording time (UTC format)
  const timestamp = event.Timestamp ? new Date(event.Timestamp * 1000).toISOString() : new Date().toISOString();

  if (!recordingUrl || !recordingSid) {
    console.error('Required recording information missing:', { recordingUrl, recordingSid });
    return callback('Recording URL and SID are required');
  }

  try {
    // Append .wav if not present (Twilio RecordingUrl is base; media fetch needs extension)
    let fullRecordingUrl = recordingUrl;
    if (!fullRecordingUrl.endsWith('.wav')) {
      fullRecordingUrl += '.wav';
    }

    console.log('Fetching recording from URL:', fullRecordingUrl);

    // Use Twilio client to fetch recording (automatically authenticated)
    let audioBuffer;
    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 2000; // 2 seconds

    while (retryCount <= maxRetries) {
      try {
        const client = context.getTwilioClient();
        const recording = await client.recordings(recordingSid).fetch();
        
        // Download the media using the media_url
        const response = await axios.get(recording.mediaUrl + '.wav', { 
          responseType: 'arraybuffer',
          timeout: 30000
        });
        
        audioBuffer = Buffer.from(response.data);
        break; // Success, exit retry loop
      } catch (fetchError) {
        if (fetchError.response && fetchError.response.status === 404 && retryCount < maxRetries) {
          console.log(`Recording not yet available (attempt ${retryCount + 1}/${maxRetries + 1}). Retrying in ${retryDelay}ms...`);
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        } else {
          throw fetchError; // Re-throw if it's not a 404 or we've exhausted retries
        }
      }
    }

    const fileSizeInMB = audioBuffer.length / (1024 * 1024);
    
    console.log('Recording fetched successfully, size:', audioBuffer.length, 'bytes', `(${fileSizeInMB.toFixed(2)} MB)`);

    // File size check as recommended by Twilio Support
    const maxFileSizeMB = 20; // Conservative limit below Mailgun's 25MB to account for email overhead
    if (fileSizeInMB > maxFileSizeMB) {
      console.warn(`Recording file size (${fileSizeInMB.toFixed(2)} MB) exceeds maximum (${maxFileSizeMB} MB). Sending download link instead of attachment.`);
      
      // Send email with download link instead of attachment for large files
      const emailBody = `
New voicemail received:

From: ${caller}
To: ${called}
Date: ${timestamp}
Recording ID: ${recordingSid}
File Size: ${fileSizeInMB.toFixed(2)} MB

Transcription:
${transcriptionText}

The voicemail recording is too large to attach directly. 
You can access it here: ${recordingUrl}

Note: This link requires Twilio account authentication to access.

---
This is an automated message. Please do not reply.
      `.trim();

      // Prepare email without attachment
      const form = new FormData();
      form.append('from', `Voicemail Alert <voicemail@${context.MAILGUN_DOMAIN}>`);
      form.append('to', context.ADMIN_EMAIL);
      form.append('subject', `New Voicemail from ${caller} (Large File - Download Link)`);
      form.append('text', emailBody);

      // Send to Mailgun without attachment
      const mailgunResponse = await axios.post(
        `https://api.mailgun.net/v3/${context.MAILGUN_DOMAIN}/messages`,
        form,
        {
          auth: { username: 'api', password: context.MAILGUN_API_KEY },
          headers: form.getHeaders(),
          timeout: 30000
        }
      );

      console.log('Large file email (download link) sent successfully. Mailgun ID:', mailgunResponse.data.id);
      
      return callback(null, { 
        success: true, 
        mailgunId: mailgunResponse.data.id,
        emailSentTo: context.ADMIN_EMAIL,
        recordingSid: recordingSid,
        attachmentMethod: 'download_link',
        fileSizeMB: fileSizeInMB.toFixed(2)
      });
    }

    // Prepare Mailgun multipart form
    const form = new FormData();
    form.append('from', `Voicemail Alert <voicemail@${context.MAILGUN_DOMAIN}>`);
    form.append('to', context.ADMIN_EMAIL);
    form.append('subject', `New Voicemail from ${caller}`);
    
    // Create detailed email body
    const emailBody = `
New voicemail received:

From: ${caller}
To: ${called}
Date: ${timestamp}
Recording ID: ${recordingSid}

Transcription:
${transcriptionText}

The audio recording is attached to this email.

---
This is an automated message. Please do not reply.
    `.trim();
    
    form.append('text', emailBody);
    form.append('attachment', audioBuffer, { 
      filename: `voicemail-${recordingSid}.wav`, 
      contentType: 'audio/wav' 
    });

    console.log('Sending email to:', context.ADMIN_EMAIL);

    // Send to Mailgun
    const mailgunResponse = await axios.post(
      `https://api.mailgun.net/v3/${context.MAILGUN_DOMAIN}/messages`,
      form,
      {
        auth: { username: 'api', password: context.MAILGUN_API_KEY },
        headers: form.getHeaders(),
        timeout: 30000 // 30 second timeout
      }
    );

    // Enhanced logging for observability as recommended by Twilio Support
    console.log('Email sent successfully. Details:', {
      mailgunId: mailgunResponse.data.id,
      emailSentTo: context.ADMIN_EMAIL,
      recordingSid: recordingSid,
      fileSizeMB: fileSizeInMB.toFixed(2),
      attachmentMethod: 'direct_attachment',
      timestamp: new Date().toISOString(),
      caller: caller,
      deliveryStatus: 'sent'
    });

    return callback(null, { 
      success: true, 
      mailgunId: mailgunResponse.data.id,
      emailSentTo: context.ADMIN_EMAIL,
      recordingSid: recordingSid,
      attachmentMethod: 'direct_attachment',
      fileSizeMB: fileSizeInMB.toFixed(2)
    });

  } catch (error) {
    // Enhanced error logging for observability as recommended by Twilio Support
    const errorMessage = error.message || 'Unknown error';
    const responseData = error.response ? error.response.data : 'No response data';
    const statusCode = error.response ? error.response.status : 'No status code';
    const errorType = error.code || 'unknown_error';

    console.error('Error sending voicemail email. Details:', {
      errorType: errorType,
      message: errorMessage,
      statusCode: statusCode,
      responseData: responseData,
      recordingSid: recordingSid,
      caller: caller,
      timestamp: new Date().toISOString(),
      emailRecipient: context.ADMIN_EMAIL,
      mailgunDomain: context.MAILGUN_DOMAIN,
      deliveryStatus: 'failed',
      stage: error.response ? 'mailgun_api' : 'recording_fetch'
    });

    return callback(`Failed to send voicemail email: ${errorMessage}`);
  }
};